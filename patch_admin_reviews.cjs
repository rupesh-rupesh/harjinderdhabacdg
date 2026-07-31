const fs = require('fs');
let code = fs.readFileSync('src/components/AdminReviews.tsx', 'utf8');

const importStatement = `import { ConfirmModal } from './ConfirmModal';`;
if (!code.includes('ConfirmModal')) {
    code = code.replace(`import toast from 'react-hot-toast';`, `import toast from 'react-hot-toast';\nimport { ConfirmModal } from './ConfirmModal';`);
}

const stateDeclaration = `  const [replyText, setReplyText] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });`;
code = code.replace(`  const [replyText, setReplyText] = useState('');`, stateDeclaration);

const oldDeleteReview = `  const deleteReview = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(\`/api/admin/reviews/\${id}\`, { method: 'DELETE' });
      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== id));
        toast.success('Review deleted');
      }
    } catch (e) {
      toast.error('Action failed');
    }
  };`;

const newDeleteReview = `  const deleteReview = async (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Review',
      message: 'Are you sure you want to delete this review? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const res = await fetch(\`/api/admin/reviews/\${id}\`, { method: 'DELETE' });
          if (res.ok) {
            setReviews(reviews.filter(r => r.id !== id));
            toast.success('Review deleted');
          } else {
            toast.error('Failed to delete review');
          }
        } catch (e) {
          toast.error('Action failed');
        }
      }
    });
  };`;
code = code.replace(oldDeleteReview, newDeleteReview);

const oldReturn = `    <div className="space-y-6">`;
const newReturn = `    <div className="space-y-6">
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />`;
code = code.replace(oldReturn, newReturn);

fs.writeFileSync('src/components/AdminReviews.tsx', code);
