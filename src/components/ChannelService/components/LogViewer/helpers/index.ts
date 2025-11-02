export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const result = date.toLocaleTimeString();

  return result;
};
