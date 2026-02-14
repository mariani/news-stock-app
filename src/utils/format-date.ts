import {formatDistanceToNow, format} from 'date-fns';

export function timeAgo(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), {addSuffix: true});
}

export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'MMM d, yyyy');
}

export function formatDateTime(dateString: string): string {
  return format(new Date(dateString), 'MMM d, yyyy h:mm a');
}
