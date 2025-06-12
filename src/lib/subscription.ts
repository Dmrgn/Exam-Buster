import { pb } from './db'; // Assuming pb is exported from db.ts
// PocketBase RecordModel is often used, but for data shapes, defining fields is sufficient.
// No direct import needed if we define all expected fields.

// --- Type Definitions ---

export interface UserUsage {
    resetTime: number; // Unix timestamp (milliseconds) for when usage last reset
    chat: number;
    "pdf view": number;
    "image view": number;
    "image gen": number;
    graphing: number;
    "exam buster": number;
    "file upload": number; // Lifetime total in MBs
}

export interface PlanLimits {
    chat?: number;
    "pdf view"?: number;
    "image view"?: number;
    "image gen"?: number;
    graphing?: number;
    "exam buster"?: number;
    "file upload"?: number; // Lifetime limit in MBs
}

// Represents a record from the 'plans' collection
export interface PlanRecord {
    id: string;
    collectionId: string;
    collectionName: string;
    created: string;
    updated: string;
    name: string;
    features: string[]; // Array of feature names, e.g., ["chat", "pdf view"]
    limits: PlanLimits;
    // expand?: any; // If needed for other expansions
}

// Represents a record from the 'users' collection
export interface UserRecord {
    id: string;
    collectionId: string;
    collectionName: string;
    created: string;
    updated: string;
    verified?: boolean;
    emailVisibility?: boolean;
    plan: string; // ID of the related plan
    usage: UserUsage;
    email?: string; // Standard user fields
    username?: string;
    name?: string;
    avatar?: string;
    expand?: {
        plan?: PlanRecord;
    };
}

// --- Custom Error Classes ---

export class SubscriptionError extends Error {
    public feature?: keyof PlanLimits;
    public limit?: number;
    public type: 'feature_unavailable' | 'limit_reached' | 'generic';

    constructor(message: string, type: 'feature_unavailable' | 'limit_reached' | 'generic' = 'generic', feature?: keyof PlanLimits, limit?: number) {
        super(message);
        this.name = 'SubscriptionError';
        this.type = type;
        this.feature = feature;
        this.limit = limit;
        Object.setPrototypeOf(this, SubscriptionError.prototype);
    }
}

// --- Helper Functions ---

function getStartOfNextDay(): number {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Start of next day
    return tomorrow.getTime();
}

export function getInitialUsage(): UserUsage {
    return {
        resetTime: getStartOfNextDay(),
        chat: 0,
        "pdf view": 0,
        "image view": 0,
        "image gen": 0,
        graphing: 0,
        "exam buster": 0,
        "file upload": 0,
    };
}


// --- Core Subscription Logic ---

/**
 * Checks if a user can use a feature based on their plan and current usage.
 * Handles daily reset of usage metrics.
 * @param userId The ID of the user.
 * @param feature The feature being accessed.
 * @param requestedAmount For countable features, typically 1. For 'file upload', the size in MB being requested.
 * @throws {SubscriptionError} If validation fails.
 */
export async function checkAndUpdateUsage(
    userId: string,
    feature: keyof PlanLimits,
    requestedAmount: number = 1
): Promise<{ user: UserRecord; plan: PlanRecord }> {
    const user = await pb.collection('users').getOne<UserRecord>(userId, { expand: 'plan' });

    if (!user.expand?.plan) {
        throw new SubscriptionError('User plan information is missing or not properly linked.', 'generic');
    }
    const plan = user.expand.plan;
    let usage = user.usage;

    // Handle Usage Reset (daily metrics)
    if (Date.now() > usage.resetTime) {
        const newUsage: UserUsage = {
            ...getInitialUsage(),
            "file upload": usage["file upload"], // Preserve lifetime file upload
            resetTime: getStartOfNextDay(),
        };
        await pb.collection('users').update<UserRecord>(userId, { usage: newUsage });
        usage = newUsage; // Use the reset usage for current checks
    }

    // Check Feature Availability
    if (!plan.features.includes(feature)) {
        throw new SubscriptionError(
            `Feature '${feature}' is not included in your current plan '${plan.name}'.`,
            'feature_unavailable',
            feature
        );
    }

    // Check Usage Limits
    const limit = plan.limits[feature];
    if (limit !== undefined) { // Only check if a limit is set for the feature
        const currentUsage = usage[feature] || 0; // Default to 0 if undefined

        if (feature === "file upload") {
            if ((currentUsage + requestedAmount) > limit) {
                throw new SubscriptionError(
                    `Uploading ${requestedAmount}MB would exceed your ${limit}MB limit for 'file upload'. Current usage: ${currentUsage}MB.`,
                    'limit_reached',
                    feature,
                    limit
                );
            }
        } else {
            if (currentUsage >= limit) {
                throw new SubscriptionError(
                    `You have reached your daily usage limit for '${feature}' (${limit}).`,
                    'limit_reached',
                    feature,
                    limit
                );
            }
        }
    }
    return { user, plan };
}

/**
 * Increments usage for a feature after it has been successfully used.
 * @param userId The ID of the user.
 * @param feature The feature whose usage is to be incremented.
 * @param amount The amount to increment by (default is 1).
 */
export async function incrementUsage(
    userId: string,
    feature: keyof PlanLimits,
    amount: number = 1
): Promise<void> {
    const user = await pb.collection('users').getOne<UserRecord>(userId);
    const currentFeatureUsage = user.usage[feature] || 0;
    const newUsage: UserUsage = {
        ...user.usage,
        [feature]: currentFeatureUsage + amount,
    };
    await pb.collection('users').update<UserRecord>(userId, { usage: newUsage });
}

/**
 * Decrements usage for the 'file upload' feature.
 * @param userId The ID of the user.
 * @param amount The amount in MB to decrement by.
 */
export async function decrementUsage(
    userId: string,
    feature: "file upload", // Explicitly for file upload
    amount: number
): Promise<void> {
    if (amount <= 0) return; // No change if amount is zero or negative

    const user = await pb.collection('users').getOne<UserRecord>(userId);
    const currentFileUploadUsage = user.usage["file upload"] || 0;
    const newFileUploadUsage = Math.max(0, currentFileUploadUsage - amount); // Ensure it doesn't go below zero

    if (newFileUploadUsage !== currentFileUploadUsage) {
        const newUsage: UserUsage = {
            ...user.usage,
            "file upload": newFileUploadUsage,
        };
        await pb.collection('users').update<UserRecord>(userId, { usage: newUsage });
    }
}
