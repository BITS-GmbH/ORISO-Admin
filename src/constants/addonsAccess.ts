import { UserRole } from '../enums/UserRole';
import type { HasRoleFn } from './caseHandoverAccess';

interface AddonsAccessContext {
    isSuperAdmin: boolean;
    hasRole: HasRoleFn;
}

/** The AddonService admin API answers for SuperAdmins and the admins of a Träger (ADR-031). */
export const canSeeAddonsSection = ({ isSuperAdmin, hasRole }: AddonsAccessContext): boolean =>
    isSuperAdmin || hasRole([UserRole.TenantAdmin, UserRole.SingleTenantAdmin]);

/** Only a SuperAdmin switches an add-on on or off for a whole Träger; Träger admins see the state. */
export const canSwitchAddonForTenant = ({ isSuperAdmin }: Pick<AddonsAccessContext, 'isSuperAdmin'>): boolean =>
    isSuperAdmin;
