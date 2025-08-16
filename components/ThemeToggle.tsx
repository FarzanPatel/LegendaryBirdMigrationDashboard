// components/ThemeToggle.tsx

type Props = { dark: boolean; toggle: () => void; };

export default function ThemeToggle({ dark, toggle }: Props) {
  return (
    <button
      onClick={toggle}
      className="ml-2 text-xs border px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {dark ? "🌑 Dark" : "🌞 Light"}
    </button>
  );
}
