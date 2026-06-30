import Family from '@/models/Family';
import FamilyMember from '@/models/FamilyMember';
import User from '@/models/User';
import { connectToDatabase } from './dbConnect';

// Create a new family
export async function createFamily(userId, familyName, userData) {
  await connectToDatabase();
  
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Create family
  const family = await Family.create({
    familyName,
    createdBy: userId,
  });

  // Create primary family member (the user)
  const primaryMember = await FamilyMember.create({
    familyId: family._id,
    userId: userId,
    name: user.fullName,
    relationship: 'self',
    dateOfBirth: user.profile?.dateOfBirth || new Date(),
    gender: user.profile?.gender || 'other',
    bloodGroup: user.profile?.bloodGroup,
    avatarColor: user.profile?.avatarColor || '#6B7280',
    isPrimary: true,
    isActive: true,
  });

  // Update user's active family
  user.activeFamilyId = family._id;
  user.families.push({
    familyId: family._id,
    role: 'admin',
  });
  await user.save();

  // Update family members array
  family.members.push(primaryMember._id);
  await family.save();

  return { family, primaryMember };
}

// Add member to family
export async function addFamilyMember(familyId, memberData) {
  await connectToDatabase();

  const family = await Family.findById(familyId);
  if (!family) throw new Error('Family not found');

  // Check if user already exists
  let user = null;
  if (memberData.email) {
    user = await User.findOne({ email: memberData.email });
  }

  const member = await FamilyMember.create({
    familyId,
    userId: user?._id || null,
    name: memberData.name,
    relationship: memberData.relationship,
    dateOfBirth: memberData.dateOfBirth,
    gender: memberData.gender,
    bloodGroup: memberData.bloodGroup,
    avatarColor: memberData.avatarColor || getRandomColor(),
    knownConditions: memberData.knownConditions || [],
    allergies: memberData.allergies || [],
    emergencyContact: memberData.emergencyContact || {},
    isPrimary: false,
    isActive: true,
  });

  family.members.push(member._id);
  await family.save();

  return member;
}

// Get all family members
export async function getFamilyMembers(familyId) {
  await connectToDatabase();
  
  const members = await FamilyMember.find({ familyId, isActive: true })
    .sort({ isPrimary: -1, createdAt: 1 });
  
  return members;
}

// Get family by ID
export async function getFamilyById(familyId) {
  await connectToDatabase();
  
  const family = await Family.findById(familyId)
    .populate('members');
  
  return family;
}

// Get user's active family
export async function getUserActiveFamily(userId) {
  await connectToDatabase();
  
  const user = await User.findById(userId).populate('activeFamilyId');
  if (!user || !user.activeFamilyId) return null;
  
  const family = await Family.findById(user.activeFamilyId._id)
    .populate('members');
  
  return family;
}

// Helper to generate random color
function getRandomColor() {
  const colors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Update family member
export async function updateFamilyMember(memberId, updateData) {
  await connectToDatabase();
  
  const member = await FamilyMember.findByIdAndUpdate(
    memberId,
    updateData,
    { new: true, runValidators: true }
  );
  
  return member;
}

// Remove family member
export async function removeFamilyMember(memberId) {
  await connectToDatabase();
  
  const member = await FamilyMember.findById(memberId);
  if (!member) throw new Error('Member not found');
  
  if (member.isPrimary) {
    throw new Error('Cannot remove primary member');
  }
  
  // Soft delete
  member.isActive = false;
  await member.save();
  
  // Remove from family's members array
  await Family.findByIdAndUpdate(member.familyId, {
    $pull: { members: memberId }
  });
  
  return member;
}

// Get family storage usage
export async function getFamilyStorage(familyId) {
  await connectToDatabase();
  
  const family = await Family.findById(familyId);
  if (!family) throw new Error('Family not found');
  
  return {
    used: family.storageUsed,
    limit: family.storageLimit,
    percentage: (family.storageUsed / family.storageLimit) * 100
  };
}

// Update family storage
export async function updateFamilyStorage(familyId, additionalStorage) {
  await connectToDatabase();
  
  const family = await Family.findById(familyId);
  if (!family) throw new Error('Family not found');
  
  family.storageUsed += additionalStorage;
  await family.save();
  
  return family;
}