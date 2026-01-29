'use client';

import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

type DeleteButtonProps = {
  transactionId: number;
  deleteAction: (id: number) => Promise<any>;
};

export default function DeleteTransactionButton({ transactionId, deleteAction }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const result = await deleteAction(transactionId);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to delete transaction.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-[10px] text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-medium uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
}