// src/lib/scan-history.ts
// Firestore service for saving and retrieving scan analysis results.
// Uses subcollections: /users/{uid}/scans/{scanId}
// This works with existing Firestore rules because subcollections
// inherit parent document permissions.

'use client';

import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  getFirestore,
  Timestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export interface ScanRecord {
  id?: string;
  assessment: string;
  confidence: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  refinedAssessment?: string;
  rationale?: string;
  createdAt: Date | Timestamp;
  // We don't store the full base64 image — too large for Firestore (1MB doc limit).
  // Instead store a thumbnail or just metadata.
  imageSize?: number; // bytes of original image
}

function getRiskLevel(assessment: string, confidence: number): ScanRecord['riskLevel'] {
  const lower = assessment.toLowerCase();
  if (lower.includes('melanoma') || lower.includes('carcinoma') || lower.includes('malignant')) {
    return confidence > 70 ? 'critical' : 'high';
  }
  if (lower.includes('suspicious') || lower.includes('atypical') || lower.includes('dysplastic')) {
    return 'moderate';
  }
  return 'low';
}

export async function saveScanResult(params: {
  assessment: string;
  confidence: number;
  refinedAssessment?: string;
  rationale?: string;
  imageSize?: number;
}): Promise<string | null> {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.warn('[DERMAFLOW] Cannot save scan — user not authenticated');
      return null;
    }

    const db = getFirestore();
    const scansRef = collection(db, 'users', user.uid, 'scans');

    const record: Omit<ScanRecord, 'id'> = {
      assessment: params.assessment,
      confidence: params.confidence,
      riskLevel: getRiskLevel(params.assessment, params.confidence),
      createdAt: Timestamp.now(),
      ...(params.refinedAssessment && { refinedAssessment: params.refinedAssessment }),
      ...(params.rationale && { rationale: params.rationale }),
      ...(params.imageSize && { imageSize: params.imageSize }),
    };

    const docRef = await addDoc(scansRef, record);
    console.log('[DERMAFLOW] Scan saved:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    // Don't crash the app if Firestore save fails — log and continue
    console.error('[DERMAFLOW] Failed to save scan:', error.code, error.message);
    return null;
  }
}

export async function getScanHistory(maxResults = 20): Promise<ScanRecord[]> {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return [];

    const db = getFirestore();
    const scansRef = collection(db, 'users', user.uid, 'scans');
    const q = query(scansRef, orderBy('createdAt', 'desc'), limit(maxResults));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    })) as ScanRecord[];
  } catch (error: any) {
    console.error('[DERMAFLOW] Failed to fetch scan history:', error.code, error.message);
    return [];
  }
}

export async function getScanStats(): Promise<{
  totalScans: number;
  avgConfidence: number;
  avgRiskLevel: string;
  lastScanDate: Date | null;
}> {
  const scans = await getScanHistory(100);

  if (scans.length === 0) {
    return { totalScans: 0, avgConfidence: 0, avgRiskLevel: 'N/A', lastScanDate: null };
  }

  const avgConfidence = Math.round(
    scans.reduce((sum, s) => sum + s.confidence, 0) / scans.length
  );

  // Determine overall risk from most recent scans
  const riskCounts = { low: 0, moderate: 0, high: 0, critical: 0 };
  scans.forEach(s => riskCounts[s.riskLevel]++);
  const avgRiskLevel = riskCounts.critical > 0 ? 'Critical'
    : riskCounts.high > 0 ? 'High'
    : riskCounts.moderate > 0 ? 'Moderate'
    : 'Low';

  return {
    totalScans: scans.length,
    avgConfidence,
    avgRiskLevel,
    lastScanDate: scans[0]?.createdAt instanceof Date ? scans[0].createdAt : null,
  };
}
