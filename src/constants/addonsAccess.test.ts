import { describe, expect, it } from 'vitest';
import { hasRoleFor } from '../components/Layout/adminNavFixtures';
import { UserRole } from '../enums/UserRole';
import { canSeeAddonsSection, canSwitchAddonForTenant } from './addonsAccess';

describe('addonsAccess', () => {
    it('shows the section to SuperAdmins and Träger admins only', () => {
        expect(canSeeAddonsSection({ isSuperAdmin: true, hasRole: hasRoleFor(UserRole.TenantAdmin) })).toBe(true);
        expect(canSeeAddonsSection({ isSuperAdmin: false, hasRole: hasRoleFor(UserRole.TenantAdmin) })).toBe(true);
        expect(canSeeAddonsSection({ isSuperAdmin: false, hasRole: hasRoleFor(UserRole.SingleTenantAdmin) })).toBe(
            true,
        );
        expect(
            canSeeAddonsSection({
                isSuperAdmin: false,
                hasRole: hasRoleFor(UserRole.AgencyAdmin, UserRole.RestrictedAgencyAdmin, UserRole.UserAdmin),
            }),
        ).toBe(false);
    });

    it('lets only a SuperAdmin switch an add-on for a Träger', () => {
        expect(canSwitchAddonForTenant({ isSuperAdmin: true })).toBe(true);
        expect(canSwitchAddonForTenant({ isSuperAdmin: false })).toBe(false);
    });
});
