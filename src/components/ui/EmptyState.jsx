import Icon from "./Icon";

export default function EmptyState({ message, iconName = "Inbox" }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-gray-300 dark:text-gray-600 mb-2">
        <Icon name={iconName} className="w-9 h-9" />
      </span>
      <p className="text-sm font-light text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}
