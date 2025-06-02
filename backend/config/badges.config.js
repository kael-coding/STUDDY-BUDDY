export const BADGE_LEVELS = [
    {
        count: 3,
        name: "Task Starter",
        level: 1,
        description: "Completed 3 tasks",
        icon: "🥉"
    },
    {
        count: 5,
        name: "Task Achiever",
        level: 2,
        description: "Completed 5 tasks",
        icon: "🏅"
    },
    {
        count: 10,
        name: "Task Master",
        level: 3,
        description: "Completed 10 tasks",
        icon: "🏆"
    },
    {
        count: 20,
        name: "Productivity Pro",
        level: 4,
        description: "Completed 20 tasks",
        icon: "🌟"
    },
    {
        count: 50,
        name: "Task Legend",
        level: 5,
        description: "Completed 50 tasks",
        icon: "👑"
    }
];

export const getBadgeByLevel = (level) => {
    return BADGE_LEVELS.find(badge => badge.level === level);
};

export const getNextBadge = (currentCount) => {
    return BADGE_LEVELS.find(level => level.count > currentCount);
};