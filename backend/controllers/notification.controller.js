import Notification from '../models/notification.model.js';

export const getNotifications = async (req, res) => {
    try {
        const userId = req.userId;

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'from',
                select: 'name profilePicture',
            })
            .populate({
                path: 'postId',
                select: 'title',
            })
            .populate({
                path: 'commentId',
                select: 'text user post',
                populate: [{
                    path: 'user',
                    select: 'name profilePicture'
                }, {
                    path: 'post',
                    select: 'title'
                }]
            })
            .populate({
                path: 'taskId',
                select: 'title dueDate',
            });

        // Only filter out notifications where the commentId is required but missing
        const filteredNotifications = notifications.filter(notification => {
            if (notification.type === 'likeComment' && !notification.commentId) {
                return false;
            }
            if (notification.type === 'postLike' && !notification.postId) {
                return false;
            }
            if (notification.type === 'taskReminder' && !notification.taskId) {
                return false;
            }
            return true;
        });

        res.status(200).json(filteredNotifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
};

export const notificationDeleteById = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.userId;
        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        if (notification.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You do not have permission to delete this notification' });
        }
        await Notification.findByIdAndDelete(notificationId);
        res.status(200).json({ message: 'Notification deleted successfully' });

    } catch (error) {
        console.error('Error deleting notification:', error);
        return res.status(500).json({ message: 'Error deleting notification', error: error.message });
    }
}

export const markAsRead = async (req, res) => {

    try {
        const notificationId = req.params.id;
        const userId = req.userId;

        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (notification.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You do not have permission to mark this notification as read' });
        }

        notification.read = true;
        await notification.save();

        res.status(200).json({ message: 'Notification marked as read successfully' });

    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Error marking notification as read', error: error.message });
    }

}