import { db, storage } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  DocumentData,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

// Resume functions
export async function uploadResume(userId: string, file: File) {
  try {
    // Generate a unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = `resumes/${fileName}`;

    // Upload file to Firebase Storage
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);

    // Save resume record in Firestore
    const resumeRef = await addDoc(collection(db, "resumes"), {
      user_id: userId,
      file_name: file.name,
      file_path: filePath,
      file_url: downloadURL,
      file_size: file.size,
      file_type: file.type,
      is_analyzed: false,
      is_enhanced: false,
      created_at: serverTimestamp(),
    });

    return { id: resumeRef.id, file_path: filePath, file_url: downloadURL };
  } catch (error: any) {
    console.error("Error uploading resume:", error);
    throw error;
  }
}

export async function getUserResumes(userId: string) {
  try {
    const resumesQuery = query(
      collection(db, "resumes"),
      where("user_id", "==", userId),
      orderBy("created_at", "desc"),
    );

    const querySnapshot = await getDocs(resumesQuery);
    const resumes: DocumentData[] = [];

    querySnapshot.forEach((doc) => {
      resumes.push({ id: doc.id, ...doc.data() });
    });

    return resumes;
  } catch (error) {
    console.error("Error getting user resumes:", error);
    throw error;
  }
}

export async function getResumeById(resumeId: string, userId: string) {
  try {
    const resumeDoc = await getDoc(doc(db, "resumes", resumeId));

    if (!resumeDoc.exists()) {
      throw new Error("Resume not found");
    }

    const resumeData = resumeDoc.data();

    // Verify ownership
    if (resumeData.user_id !== userId) {
      throw new Error("Unauthorized access to resume");
    }

    return { id: resumeDoc.id, ...resumeData };
  } catch (error) {
    console.error("Error getting resume:", error);
    throw error;
  }
}

// Resume analysis functions
export async function saveResumeAnalysis(analysisData: any) {
  try {
    const analysisRef = await addDoc(collection(db, "resume_analyses"), {
      ...analysisData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    // Update the resume to mark it as analyzed
    await updateDoc(doc(db, "resumes", analysisData.resume_id), {
      is_analyzed: true,
    });

    return { id: analysisRef.id };
  } catch (error) {
    console.error("Error saving resume analysis:", error);
    throw error;
  }
}

export async function getResumeAnalysis(resumeId: string, userId: string) {
  try {
    // First verify resume ownership
    const resumeDoc = await getDoc(doc(db, "resumes", resumeId));

    if (!resumeDoc.exists()) {
      throw new Error("Resume not found");
    }

    const resumeData = resumeDoc.data();

    if (resumeData.user_id !== userId) {
      throw new Error("Unauthorized access to resume");
    }

    // Get the analysis
    const analysisQuery = query(
      collection(db, "resume_analyses"),
      where("resume_id", "==", resumeId),
      limit(1),
    );

    const querySnapshot = await getDocs(analysisQuery);

    if (querySnapshot.empty) {
      return null;
    }

    const analysisDoc = querySnapshot.docs[0];
    return { id: analysisDoc.id, ...analysisDoc.data() };
  } catch (error) {
    console.error("Error getting resume analysis:", error);
    throw error;
  }
}

// Subscription functions
export async function saveSubscription(subscriptionData: any) {
  try {
    const subscriptionRef = await addDoc(collection(db, "subscriptions"), {
      ...subscriptionData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    return { id: subscriptionRef.id };
  } catch (error) {
    console.error("Error saving subscription:", error);
    throw error;
  }
}

export async function getUserSubscription(userId: string) {
  try {
    const subscriptionQuery = query(
      collection(db, "subscriptions"),
      where("user_id", "==", userId),
      where("status", "==", "active"),
      limit(1),
    );

    const querySnapshot = await getDocs(subscriptionQuery);

    if (querySnapshot.empty) {
      return null;
    }

    const subscriptionDoc = querySnapshot.docs[0];
    return { id: subscriptionDoc.id, ...subscriptionDoc.data() };
  } catch (error) {
    console.error("Error getting user subscription:", error);
    throw error;
  }
}
