export const formatCurrency = (amount: number): string => {
  return '₹' + amount.toLocaleString('en-IN');
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return 'Today, ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} days ago`;
  }
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const categoryIcons: Record<string, string> = {
  'dining': 'restaurant',
  'food & dining': 'restaurant',
  'shopping': 'shopping_bag',
  'transport': 'directions_car',
  'housing': 'home',
  'rent & utilities': 'home',
  'leisure': 'confirmation_number',
  'entertainment': 'confirmation_number',
  'health': 'medical_services',
  'education': 'school',
  'salary': 'payments',
  'freelance': 'work',
  'investment': 'trending_up',
  'other': 'category',
};

export const getCategoryIcon = (category: string): string => {
  return categoryIcons[category.toLowerCase()] || 'category';
};

export const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};
