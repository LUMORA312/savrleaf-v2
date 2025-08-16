import Modal from './Modal';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'partner' | 'admin';
  isActive: boolean;
  dispensaries?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface UserModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserModal({ user, isOpen, onClose }: UserModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <h3 className="text-2xl font-bold mb-4">{user.firstName} {user.lastName}</h3>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        <p>Status: {user.isActive ? 'Active' : 'Inactive'}</p>
        <button
          onClick={onClose}
          className="mt-4 bg-gray-600 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
