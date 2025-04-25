import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table } from '@/components/ui/table';
import { RoleService, Role, RoleHierarchy } from '@/lib/auth/role-service';
import { Trash2, Plus } from 'lucide-react';

/**
 * RoleHierarchyManager Component
 *
 * This component provides an interface for managing role hierarchies.
 * It allows administrators to:
 * - View existing role hierarchies
 * - Create new role hierarchies
 * - Delete existing role hierarchies
 */
export default function RoleHierarchyManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [hierarchies, setHierarchies] = useState<RoleHierarchy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [selectedChildRoleId, setSelectedChildRoleId] = useState<string>('');

  const roleService = RoleService.getBrowserInstance();

  // Load roles and hierarchies on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load roles
        const rolesResult = await roleService.getAllRoles();
        if (rolesResult.error) {
          throw new Error(rolesResult.error.message);
        }
        setRoles(rolesResult.data || []);

        // Load hierarchies
        const hierarchiesResult = await roleService.getAllRoleHierarchies();
        if (hierarchiesResult.error) {
          throw new Error(hierarchiesResult.error.message);
        }
        setHierarchies(hierarchiesResult.data || []);
      } catch (err) {
        const error = err as { message?: string };
        setError(error.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [roleService]);

  // Handle form submission to create a new hierarchy
  const handleAddRoleHierarchy = async () => {
    if (!selectedRoleId || !selectedChildRoleId || selectedRoleId === selectedChildRoleId) {
      setError('Please select both parent and child roles');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await roleService.createRoleHierarchy(selectedRoleId, selectedChildRoleId);

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Reload hierarchies
      const hierarchiesResult = await roleService.getAllRoleHierarchies();
      if (hierarchiesResult.error) {
        throw new Error(hierarchiesResult.error.message);
      }

      setHierarchies(hierarchiesResult.data || []);
      setSuccess(`Successfully created hierarchy: ${selectedRoleId} > ${selectedChildRoleId}`);

      // Reset form
      setSelectedRoleId('');
      setSelectedChildRoleId('');
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to create hierarchy');
    } finally {
      setLoading(false);
    }
  };

  // Handle hierarchy deletion
  const handleDeleteRoleHierarchy = async (hierarchy: RoleHierarchy) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await roleService.removeRoleHierarchy(
        hierarchy.parent_role_id,
        hierarchy.child_role_id
      );

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Reload hierarchies
      const hierarchiesResult = await roleService.getAllRoleHierarchies();
      if (hierarchiesResult.error) {
        throw new Error(hierarchiesResult.error.message);
      }

      setHierarchies(hierarchiesResult.data || []);
      setSuccess(
        `Successfully removed hierarchy: ${hierarchy.parent_role_id} > ${hierarchy.child_role_id}`
      );
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to remove hierarchy');
    } finally {
      setLoading(false);
    }
  };

  // Get role name by ID
  const getRoleName = (roleId: string): string => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown Role';
  };

  return (
    <Card title="Manage Role Hierarchies (Inheritance)" className="mb-6">
      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="mb-4">
          {success}
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="parentRole" className="block text-sm font-medium mb-1">
            Parent Role
          </label>
          <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
            <SelectTrigger id="parentRole" className="w-full">
              <SelectValue placeholder="Select parent role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map(role => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="childRole" className="block text-sm font-medium mb-1">
            Child Role (Inherits Permissions)
          </label>
          <Select value={selectedChildRoleId} onValueChange={setSelectedChildRoleId}>
            <SelectTrigger id="childRole" className="w-full">
              <SelectValue placeholder="Select child role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map(role => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button
        className="mt-4"
        onClick={handleAddRoleHierarchy}
        disabled={!selectedRoleId || !selectedChildRoleId || selectedRoleId === selectedChildRoleId}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Role Hierarchy
      </Button>

      <div>
        <h3 className="text-lg font-medium mb-2">Existing Hierarchies</h3>
        <p className="text-sm text-gray-600 mb-4">
          This table shows all existing role hierarchies. Parent roles inherit permissions from
          child roles.
        </p>

        {loading && <p className="text-center py-4">Loading...</p>}

        {!loading && hierarchies.length === 0 && (
          <p className="text-center py-4">No role hierarchies found</p>
        )}

        {!loading && hierarchies.length > 0 && (
          <Table>
            <thead>
              <tr>
                <th>Parent Role</th>
                <th>Child Role</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hierarchies.map(hierarchy => (
                <tr key={hierarchy.id}>
                  <td>{getRoleName(hierarchy.parent_role_id)}</td>
                  <td>{getRoleName(hierarchy.child_role_id)}</td>
                  <td>{new Date(hierarchy.created_at || '').toLocaleString()}</td>
                  <td>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteRoleHierarchy(hierarchy)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </Card>
  );
}
