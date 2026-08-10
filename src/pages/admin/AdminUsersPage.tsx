import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/Loading';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Alert } from '../../components/ui/Alert';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useLanguage } from '../../contexts/useLanguage';
import { usersApi } from '../../api/users';
import type { User, UserCreate, UserAdminUpdate } from '../../types/api';
import { PlusIcon, PencilIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline';
import { PaginationBar } from '../../components/ui/PaginationBar';
import { slicePage, visibleRange } from '../../lib/pagination';
import { useScrollToTopOnPageChange } from '../../hooks/useScrollToTopOnPageChange';

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [page, setPage] = useState(1);
  const listAnchorRef = useRef<HTMLDivElement>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAllUsers(),
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((user) => {
      const matchesSearch = 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesRole = !roleFilter || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const pageSize = itemsPerPage === -1 ? -1 : itemsPerPage;
  const pagedUsers = useMemo(
    () => slicePage(filteredUsers, page, pageSize),
    [filteredUsers, page, pageSize]
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm, roleFilter, itemsPerPage]);

  useScrollToTopOnPageChange(page, listAnchorRef);

  const deleteMutation = useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteUserId(null);
    },
  });

  const handleDelete = (id: number) => {
    setDeleteUserId(id);
  };

  const confirmDelete = () => {
    if (deleteUserId) {
      deleteMutation.mutate(deleteUserId);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('users')}</h2>
          <p className="text-gray-600">{t('manageSystemUsers')}</p>
        </div>
        <Button
          onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {t('addUser')}
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder={t('searchUsers')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: '', label: t('allRoles') },
              { value: 'USER', label: t('user') },
              { value: 'ADMIN', label: t('admin') },
            ]}
          />
        </div>
        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('itemsPerPage')}:</label>
          <div className="w-28">
            <Select
              value={itemsPerPage.toString()}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              options={[
                { value: '10', label: '10' },
                { value: '20', label: '20' },
                { value: '50', label: '50' },
                { value: '-1', label: t('all') },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Users List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredUsers && filteredUsers.length > 0 ? (
        <>
        <div ref={listAnchorRef} className="h-0" aria-hidden />
        {itemsPerPage === -1 ? (
          <div className="mb-4 text-sm text-gray-600">
            {t('showingXofY')
              .replace('{current}', String(pagedUsers.length))
              .replace('{total}', String(filteredUsers.length))}
          </div>
        ) : (
          <div className="mb-4 text-sm text-gray-600">
            {(() => {
              const { from, to } = visibleRange(page, pageSize, filteredUsers.length, pagedUsers.length);
              return t('showingRangeFromTo')
                .replace('{from}', from ? String(from) : '0')
                .replace('{to}', to ? String(to) : '0')
                .replace('{total}', String(filteredUsers.length));
            })()}
          </div>
        )}
        <div className="grid grid-cols-1 gap-4">
          {pagedUsers.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary-100 rounded-full p-3">
                    <UserIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user.email}
                      <span className="ml-2 text-sm text-gray-500 font-normal">
                        (ID: {user.id})
                      </span>
                    </h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                      {user.phone && (
                        <span className="text-sm text-gray-500">
                          📞 {user.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingUser(user);
                      setIsModalOpen(true);
                    }}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(user.id)}
                  >
                    <TrashIcon className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        {itemsPerPage !== -1 && (
          <PaginationBar
            page={page}
            pageSize={pageSize}
            totalItems={filteredUsers.length}
            onPageChange={setPage}
            className="mt-4"
          />
        )}
        </>
      ) : (
        <Card className="p-12 text-center">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{t('noUsersFound')}</p>
        </Card>
      )}

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
      />

      <ConfirmDialog
        isOpen={deleteUserId !== null}
        onClose={() => setDeleteUserId(null)}
        onConfirm={confirmDelete}
        title={t('deleteUser')}
        message={t('confirmDeleteUser')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

function emptyUserForm(): UserCreate | UserAdminUpdate {
  return {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'USER',
  };
}

function userFormFromUser(user: User | null): UserCreate | UserAdminUpdate {
  if (!user) return emptyUserForm();
  return {
    email: user.email || '',
    password: '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phoneNumber: user.phone || user.phoneNumber || '',
    role: user.role || 'USER',
  };
}

function UserFormModal({ 
  isOpen, 
  onClose, 
  user 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  user: User | null;
}) {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<UserCreate | UserAdminUpdate>(() =>
    userFormFromUser(user)
  );

  const extractApiError = (err: unknown, fallback: string) => {
    const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
    return typeof message === 'string' && message.trim() !== '' ? message : fallback;
  };

  const editingKey = user?.id ?? 'new';

  useEffect(() => {
    if (!isOpen) return;
    setFormData(userFormFromUser(user));
    setError(null);
    // Re-seed when the modal opens or a different user is selected — not when the same row is replaced by a refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `user` is intentional when `editingKey` / `isOpen` change
  }, [isOpen, editingKey]);

  const createMutation = useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setError(null);
      onClose();
    },
    onError: (error: any) => {
      setError(extractApiError(error, t('userCreateError') || 'Failed to create user'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserAdminUpdate }) => 
      usersApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setError(null);
      onClose();
    },
    onError: (error: any) => {
      setError(extractApiError(error, t('userUpdateError') || 'Failed to update user'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (user) {
      // Update existing user
      const updateData: UserAdminUpdate = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        role: formData.role,
      };
      
      // Only include password if it was changed
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      updateMutation.mutate({ id: user.id, data: updateData });
    } else {
      // Create new user
      if (!formData.password) {
        setError(t('passwordRequired') || 'Password is required for new users');
        return;
      }
      createMutation.mutate(formData as UserCreate);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? t('editUser') : t('addUser')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}
        
        <Input
          label={t('email')}
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <Input
          label={user ? t('newPassword') : t('password')}
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required={!user}
          placeholder={user ? t('leaveBlankToKeepCurrent') : ''}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('firstName')}
            value={formData.firstName || ''}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
          <Input
            label={t('lastName')}
            value={formData.lastName || ''}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>
        <Input
          label={t('phoneNumber')}
          type="tel"
          value={formData.phoneNumber || ''}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
        />
        <Select
          label={t('role')}
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as 'USER' | 'ADMIN' })}
          options={[
            { value: 'USER', label: t('user') },
            { value: 'ADMIN', label: t('admin') },
          ]}
        />
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
            {user ? t('save') : t('add')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
