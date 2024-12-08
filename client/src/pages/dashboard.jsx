import React, { useEffect, useState } from "react";
import {
  MdAdminPanelSettings,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { LuClipboardEdit } from "react-icons/lu";
import { FaNewspaper, FaUsers } from "react-icons/fa";
import { FaArrowsToDot } from "react-icons/fa6";
import moment from "moment";
import axios from "axios";
import clsx from "clsx";
import { BGS, PRIOTITYSTYELS, TASK_TYPE, getInitials } from "../utils";
import UserInfo from "../components/UserInfo";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const [summary, setSummary] = useState({
    totalTasks: 0,
    tasks: {},
    allTasks: [], // Updated to handle all tasks
    users: [],
  });

  // Simulate isAdmin state (can be fetched or passed as prop)
  const { user } = useSelector((state) => state.auth); // Fetch user data from Redux
  const isAdmin = user?.isAdmin;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await axios.get("/api/task/dashboard");
        console.log("data", data);
        console.log("data response", data.summary);
        
        // Mapping users by their IDs for easy access
        const usersMap = data.summary.users.reduce((acc, user) => {
          acc[user._id] = user;
          return acc;
        }, {});

        setSummary({
          ...data.summary,
          usersMap,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const totals = summary.tasks;

  const stats = [
    {
      _id: "1",
      label: "TOTAL TASK",
      total: summary.totalTasks || 0,
      icon: <FaNewspaper />,
      bg: "bg-[#1d4ed8]",
    },
    {
      _id: "2",
      label: "COMPLETED TASK",
      total: totals["completed"] || 0,
      icon: <MdAdminPanelSettings />,
      bg: "bg-[#0f766e]",
    },
    {
      _id: "3",
      label: "TASK IN PROGRESS",
      total: totals["in progress"] || 0,
      icon: <LuClipboardEdit />,
      bg: "bg-[#f59e0b]",
    },
    {
      _id: "4",
      label: "TO DOs",
      total: totals["todo"] || 0,
      icon: <FaArrowsToDot />,
      bg: "bg-[#be185d]",
    },
  ];

  const TaskTable = ({ tasks }) => {
    const ICONS = {
      high: <MdKeyboardDoubleArrowUp />,
      medium: <MdKeyboardArrowUp />,
      low: <MdKeyboardArrowDown />,
    };
  
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const tasksPerPage = 10;
  
    // Sort tasks: First by whether the task is overdue, then by due date
    const sortedTasks = tasks?.sort((a, b) => {
      const currentDate = new Date();
  
      const aIsOverdue = new Date(a.date) < currentDate;
      const bIsOverdue = new Date(b.date) < currentDate;
  
      if (aIsOverdue && !bIsOverdue) {
        return -1; // a comes before b (a is overdue, b is not)
      } else if (!aIsOverdue && bIsOverdue) {
        return 1; // b comes before a (b is overdue, a is not)
      } else {
        return new Date(a.date) - new Date(b.date);
      }
    });
  
    // Get current tasks to display based on the current page
    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    
    const currentTasks = sortedTasks?.slice(indexOfFirstTask, indexOfLastTask);
  
    // Handle page change
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
    // Calculate total pages
    const totalPages = Math.ceil(sortedTasks?.length / tasksPerPage);
  
    return (
      <div className="w-full  bg-white px-2 md:px-4 pt-4 pb-4 shadow-md rounded">
        <table className="w-full">
          <thead className="border-b border-gray-300">
            <tr className="text-black text-left">
              <th className="py-2">Task Title</th>
              <th className="py-2">Priority</th>
              <th className="py-2">Team</th>
              <th className="py-2">Assign Date</th>
              <th className="py-2">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {currentTasks?.map((task, id) => (
              <tr
                key={id}
                className="border-b border-gray-300 text-gray-600 hover:bg-gray-300/10"
              >
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <div className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage])} />
                    <p className="text-base text-black">{task.title}</p>
                  </div>
                </td>
                <td className="py-2">
                  <div className="flex gap-1 items-center">
                    <span className={clsx("text-lg", PRIOTITYSTYELS[task.priority])}>
                      {ICONS[task.priority]}
                    </span>
                    <span className="capitalize">{task.priority}</span>
                  </div>
                </td>
                <td className="py-2">
                  <div className="flex">
                    {task?.team?.map((userId, index) => {
                      const user = summary.usersMap[userId]; // Fetch user details from the map
                      return user ? (
                        <div key={index} className={clsx("w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1", BGS[index % BGS.length])}>
                          <UserInfo user={summary.usersMap[userId]} />                          {/* Render user info */}
                        </div>
                      ) : null;
                    })}
                  </div>
                </td>
                
                <td className="py-2">
                  <span className="text-base text-gray-600">
                    {moment(task?.createdAt).fromNow()}
                  </span>
                </td>
                <td className="py-2">
                  <span className="text-base text-gray-600">
                    {moment(task?.date).fromNow()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
  
        {/* Pagination Controls */}
        {sortedTasks.length > tasksPerPage && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 mr-2 bg-blue-500 text-white rounded"
            >
              Previous
            </button>
            <span className="text-lg">{currentPage}</span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 ml-2 bg-blue-500 text-white rounded"
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };
  
  const UserTable = ({ users }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;
  
    // Get current users to display based on the current page
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users?.slice(indexOfFirstUser, indexOfLastUser);
  
    // Handle page change
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
    // Calculate total pages
    const totalPages = Math.ceil(users?.length / usersPerPage);
  
    return (
      <div className="w-full md:w-1/3 bg-white h-fit px-2 md:px-6 py-4 shadow-md rounded">
        <table className="w-full mb-5">
          <thead className="border-b border-gray-300">
            <tr className="text-black text-left">
              <th className="py-2">Full Name</th>
              <th className="py-2">Status</th>
              <th className="py-2">Created At</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers?.map((user, index) => (
              <tr
                key={index + user?._id}
                className="border-b border-gray-200 text-gray-600 hover:bg-gray-400/10"
              >
                <td className="py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-violet-700">
                      <span className="text-center">{getInitials(user?.name)}</span>
                    </div>
                    <div>
                      <p>{user.name}</p>
                      <span className="text-xs text-grey">{user?.role}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <p
                    className={clsx(
                      "w-fit px-3 py-1 rounded-full text-sm",
                      user?.isActive ? "bg-blue-200" : "bg-yellow-100"
                    )}
                  >
                    {user?.isActive ? "Active" : "Disabled"}
                  </p>
                </td>
                <td className="py-2 text-sm text-end">
                  {moment(user?.createdAt).fromNow()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
  
        {/* Pagination Controls */}
        {users.length > usersPerPage && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 mr-2 bg-blue-500 text-white rounded"
            >
              Previous
            </button>
            <span className="text-lg">{currentPage}</span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 ml-2 bg-blue-500 text-white rounded"
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };  

  const Card = ({ label, count, bg, icon }) => (
    <div className="w-full h-32 bg-white p-5 shadow-md rounded-md flex items-center justify-between">
      <div className="h-full flex flex-1 flex-col justify-between">
        <p className="text-base text-black-600">{label}</p>
        <span className="text-2xl font-semibold justify-center">{count}</span>
        {/* <span className="text-sm text-gray-400">{"110 last month"}</span> */}
      </div>
      <div
        className={clsx(
          "w-14 h-14 rounded-full flex items-center justify-center text-white",
          bg
        )}
      >
        {React.cloneElement(icon, { className: 'text-4xl' })}
      </div>
    </div>
  );

  return (
    <div className="h-full py-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {stats.map(({ icon, bg, label, total }, index) => (
          <Card key={index} icon={icon} bg={bg} label={label} count={total} />
        ))}
      </div>
      <div className="w-full flex flex-col md:flex-row gap-4 2xl:gap-8 mt-6">
        <TaskTable tasks={summary.allTasks} team = {summary} className={clsx(
      "bg-white px-2 md:px-4 pt-4 pb-4 shadow-md rounded",
      isAdmin ? "w-full md:w-2/3" : "w-full"
    )}/>

         {/* Conditionally render UserTable if isAdmin is true */}
         {isAdmin && <UserTable users={summary.users} />}
      </div>
    </div>
  );
};

export default Dashboard;
