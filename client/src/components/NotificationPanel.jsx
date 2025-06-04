import { Popover, Transition } from "@headlessui/react";
import moment from "moment";
import { Fragment, useState, useEffect } from "react";
import { BiSolidMessageRounded } from "react-icons/bi";
import { HiBellAlert } from "react-icons/hi2";
import { IoIosNotificationsOutline } from "react-icons/io";
import { Link } from "react-router-dom";
import axios from "axios";

const ICONS = {
  alert: (
    <HiBellAlert className="h-5 w-5 text-gray-600 group-hover:text-indigo-600" />
  ),
  message: (
    <BiSolidMessageRounded className="h-5 w-5 text-gray-600 group-hover:text-indigo-600" />
  ),
};

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from the API
  const fetchNotifications = async () => {
    try {
      const response = await axios.get("/api/user/notifications");
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Mark notifications as read
  const markAsRead = async (type, id = null) => {
    try {
      await axios.put(
        "/api/user/read-noti",
        {},
        { params: { isReadType: type, id } }
      );
      fetchNotifications(); // Refresh notifications after marking as read
    } catch (error) {
      console.error("Error marking notification as read:", error.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const callsToAction = [
    { name: "Cancel", href: "#" },
    {
      name: "Mark All Read",
      href: "#",
      onClick: () => markAsRead("all"),
    },
  ];

  return (
    <Popover className="relative">
      <Popover.Button className="inline-flex items-center outline-none">
        <div className="w-8 h-8 flex items-center justify-center text-gray-800 relative">
          <IoIosNotificationsOutline className="text-2xl" />
          {notifications?.length > 0 && (
            <span className="absolute text-center top-0 right-1 text-sm text-white font-semibold w-4 h-4 rounded-full bg-red-600">
              {notifications.length}
            </span>
          )}
        </div>
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="absolute -right-16 md:-right-2 z-10 mt-5 flex w-screen max-w-max px-4">
          {({ close }) =>
            loading ? (
              <div className="p-4">Loading notifications...</div>
            ) : notifications.length > 0 ? (
              <div className="w-screen max-w-md flex-auto overflow-hidden rounded-3xl bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
                <div className="p-4">
                  {notifications.slice(0, 5).map((item) => (
                    <div
                      key={item._id}
                      className="group relative flex gap-x-4 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="mt-1 h-8 w-8 flex items-center justify-center rounded-lg bg-gray-200 group-hover:bg-white">
                        {ICONS[item.notiType]}
                      </div>

                      <div
                        className="cursor-pointer"
                        onClick={() => markAsRead("single", item._id)}
                      >
                        <div className="flex items-center gap-3 font-semibold text-gray-900 capitalize">
                          <p>{item.notiType}</p>
                          <span className="text-xs font-normal lowercase">
                            {moment(item.createdAt).fromNow()}
                          </span>
                        </div>
                        <p className="line-clamp-1 mt-1 text-gray-600">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 divide-x bg-gray-50">
                  {callsToAction.map((action) => (
                    <Link
                      key={action.name}
                      onClick={action.onClick ? () => action.onClick() : () => close()}
                      className="flex items-center justify-center gap-x-2.5 p-3 font-semibold text-blue-600 hover:bg-gray-100"
                    >
                      {action.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4">No notifications available.</div>
            )
          }
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};

export default NotificationPanel;

