import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ProfileInfo, MyListings, ChangePassword } from "@/components/profile";

interface ProfileProps {
  isRTL?: boolean;
}

export const Profile: React.FC<ProfileProps> = ({ isRTL = false }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("profile");

  const tabs = [
    {
      id: "profile",
      label: "👤 " + t("profile.info"),
      component: <ProfileInfo />,
    },
    {
      id: "listings",
      label: "📂 " + t("profile.my_listings"),
      component: <MyListings />,
    },
    {
      id: "password",
      label: "🔒 " + t("profile.change_password"),
      component: <ChangePassword />,
    },
  ];

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 ${isRTL ? "rtl" : "ltr"}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          {t("profile.title")}
        </h2>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8" aria-label="Profile tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {tabs.find((tab) => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
};
