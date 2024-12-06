import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/axios';
import { FaChevronLeft, FaCheck, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';

const NotificationScreen = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      console.log('Fetched notifications:', response.data);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      console.log('Marking notification as read:', notificationId);
      await api.post(`/notifications/${notificationId}/read`);
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => 
          notif._id === notificationId 
            ? { ...notif, read: true } 
            : notif
        )
      );
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      console.log('Marking all notifications as read');
      await api.post('/notifications/mark-all-read');
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => ({ ...notif, read: true }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      console.log('Deleting notification:', notificationId);
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(notifications.filter(notif => notif._id !== notificationId));
      toast.success('Notification deleted');
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-orange-500 p-4 flex items-center justify-between z-10">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="text-white mr-4">
            <FaChevronLeft size={24} />
          </button>
          <h1 className="text-white text-xl font-bold">Notifications</h1>
        </div>
        {notifications.some(n => !n.read) && (
          <button
            onClick={markAllAsRead}
            className="text-white text-sm bg-orange-600 px-3 py-1 rounded-full hover:bg-orange-700 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List with added top margin */}
      <div className="mt-20 px-4"> {/* Increased top margin */}
        {notifications.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No notifications yet
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white rounded-xl p-4 shadow-sm ${
                  !notification.read ? 'border-l-4 border-orange-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={`${import.meta.env.VITE_PROD_BASE_URL}/${notification.sender.profilePicture}`}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-gray-800">
                        <span 
                          className="font-semibold cursor-pointer hover:text-orange-500"
                          onClick={() => navigate(`/user/${notification.sender._id}`)}
                        >
                          {notification.sender.name || 'Someone'}
                        </span>
                        {notification.type === 'like' ? ' liked' : ' commented on'} your recipe "
                        <span 
                          className="font-semibold cursor-pointer hover:text-orange-500"
                          onClick={() => navigate(`/recipes/${notification.recipe._id}`)}
                        >
                          {notification.recipe.title}
                        </span>"
                      </p>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification._id);
                        }}
                        className="text-orange-500 hover:text-orange-600 transition-colors"
                      >
                        <FaCheck size={16} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNotificationToDelete(notification);
                        setShowDeleteModal(true);
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Notification
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this notification?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setNotificationToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteNotification(notificationToDelete._id)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationScreen; 