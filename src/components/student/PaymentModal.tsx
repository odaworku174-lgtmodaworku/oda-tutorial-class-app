import React from 'react';
import { Subject } from '../../types';
import { CoursePurchaseModal } from './CoursePurchaseModal';

interface PaymentModalProps {
  subject: Subject;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ subject, isOpen, onClose }) => {
  return (
    <CoursePurchaseModal
      isOpen={isOpen}
      onClose={onClose}
      targetGrade={subject.grade}
      initialSelectedSubjectId={subject.id}
    />
  );
};
