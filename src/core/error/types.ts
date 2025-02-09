export interface ErrorScreenProps {
  error: Error | null;
  resetError?: () => void;
}
