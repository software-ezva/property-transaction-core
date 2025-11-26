import { ProfileType } from '../enums/profile-type.enum';

/**
 * Maps ProfileType enum values to their corresponding Brokerage relation names.
 * Used for dynamic TypeORM queries when filtering brokerages by user profile type.
 */
export const PROFILE_BROKERAGE_RELATION_MAP: Partial<
  Record<ProfileType, 'brokers' | 'agents' | 'supportingProfessionals'>
> = {
  [ProfileType.BROKER]: 'brokers',
  [ProfileType.TRANSACTION_COORDINATOR_AGENT]: 'agents',
  [ProfileType.SUPPORTING_PROFESSIONAL]: 'supportingProfessionals',
};

/**
 * Gets the Brokerage relation name for a given ProfileType.
 * @param profileType - The profile type to map
 * @returns The relation name or null if not mapped
 */
export function getBrokerageRelationForProfileType(
  profileType?: ProfileType | string | null,
): 'brokers' | 'agents' | 'supportingProfessionals' | null {
  if (!profileType) return null;
  return PROFILE_BROKERAGE_RELATION_MAP[profileType as ProfileType] ?? null;
}
