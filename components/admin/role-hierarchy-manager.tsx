import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Select } from '@/components/ui/select';
import { Table } from '@/components/ui/table';
import { RoleService, Role, RoleHierarchy } from '@/lib/auth/role-service';

/**
 * RoleHierarchyManager Component
 * 
 * This component provides an interface for managing role hierarchies.
 * It allows administrators to:
 * - View existing role hierarchies
 * - Create new role hierarchies
 * - Delete existing role hierarchies
 */
export const RoleHierarchyManager: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [hierarchies, setHierarchies] = useState<RoleHierarchy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [parentRoleName, setParentRoleName] = useState<string>('');
  const [childRoleName, setChildRoleName] = useState<string>('');
  
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
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Handle form submission to create a new hierarchy
  const handleCreateHierarchy = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!parentRoleName || !childRoleName) {
      setError('Please select both parent and child roles');
      return;
    }
    
    if (parentRoleName === childRoleName) {
      setError('Parent and child roles cannot be the same');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await roleService.createRoleHierarchy(parentRoleName, childRoleName);
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      // Reload hierarchies
      const hierarchiesResult = await roleService.getAllRoleHierarchies();
      if (hierarchiesResult.error) {
        throw new Error(hierarchiesResult.error.message);
      }
      
      setHierarchies(hierarchiesResult.data || []);
      setSuccess(`Successfully created hierarchy: ${parentRoleName} > ${childRoleName}`);
      
      // Reset form
      setParentRoleName('');
      setChildRoleName('');
    } catch (err: any) {
      setError(err.message || 'Failed to create hierarchy');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle hierarchy deletion
  const handleDeleteHierarchy = async (parentRoleName: string, childRoleName: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await roleService.removeRoleHierarchy(parentRoleName, childRoleName);
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      // Reload hierarchies
      const hierarchiesResult = await roleService.getAllRoleHierarchies();
      if (hierarchiesResult.error) {
        throw new Error(hierarchiesResult.error.message);
      }
      
      setHierarchies(hierarchiesResult.data || []);
      setSuccess(`Successfully removed hierarchy: ${parentRoleName} > ${childRoleName}`);
    } catch (err: any) {
      setError(err.message || 'Failed to remove hierarchy');
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
    <Card title="Role Hierarchy Management" className="mb-6">
      {error && (
        <Alert type="error" className="mb-4" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert type="success" className="mb-4" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Create Role Hierarchy</h3>
        <p className="text-sm text-gray-600 mb-4">
          Role hierarchies allow permissions to be inherited. A parent role inherits all permissions from its child roles.
        </p>
        
        <form onSubmit={handleCreateHierarchy} className="flex flex-wrap gap-4 items-end">
          <div className="w-full md:w-auto">
            <Select
              label="Parent Role"
              value={parentRoleName}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setParentRoleName(e.target.value)}
              disabled={loading}
              required
            >
              <option value="">Select Parent Role</option>
              {roles.map((role) => (
                <option key={`parent-${role.id}`} value={role.name}>
                  {role.name} {role.description ? `(${role.description})` : ''}
                </option>
              ))}
            </Select>
          </div>
          
          <div className="w-full md:w-auto flex items-center justify-center">
            <span className="text-lg font-bold">→</span>
          </div>
          
          <div className="w-full md:w-auto">
            <Select
              label="Child Role"
              value={childRoleName}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setChildRoleName(e.target.value)}
              disabled={loading}
              required
            >
              <option value="">Select Child Role</option>
              {roles.map((role) => (
                <option key={`child-${role.id}`} value={role.name}>
                  {role.name} {role.description ? `(${role.description})` : ''}
                </option>
              ))}
            </Select>
          </div>
          
          <div className="w-full md:w-auto">
            <Button type="submit" disabled={loading}>
              Create Hierarchy
            </Button>
          </div>
        </form>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Existing Hierarchies</h3>
        <p className="text-sm text-gray-600 mb-4">
          This table shows all existing role hierarchies. Parent roles inherit permissions from child roles.
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
              {hierarchies.map((hierarchy) => (
                <tr key={hierarchy.id}>
                  <td>{getRoleName(hierarchy.parent_role_id)}</td>
                  <td>{getRoleName(hierarchy.child_role_id)}</td>
                  <td>{new Date(hierarchy.created_at || '').toLocaleString()}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteHierarchy(
                        getRoleName(hierarchy.parent_role_id),
                        getRoleName(hierarchy.child_role_id)
                      )}
                      disabled={loading}
                    >
                      Remove
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
};

export default RoleHierarchyManager;
