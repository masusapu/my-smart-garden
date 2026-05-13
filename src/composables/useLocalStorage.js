import { ref, watch } from "vue";

export function useLocalStorage(key, defaultValue) {
  const readStoredValue = () => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      console.error(`Cannot read localStorage key "${key}":`, error);
      return defaultValue;
    }
  };

  const data = ref(readStoredValue());

  watch(
    data,
    (newValue) => {
      try {
        localStorage.setItem(key, JSON.stringify(newValue));
      } catch (error) {
        console.error(`Cannot write localStorage key "${key}":`, error);
      }
    },
    { deep: true },
  );

  return data;
}
