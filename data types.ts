export interface user {
    _id: number;
    username: string;
    password: string;
    age: number;
}
export interface following
{
    follower_id: number;
    following_id: number;
    date: Date;
}

export interface post {
    _id: number;
    user_id: number;
    content: string;
    image_content: string;
    created_at: Date;
}

export interface comment
{
    _id: number;
    user_id: number;
    post_id: number;
    content: string;
    created_at: Date;
    parent_id: number|null;
}

export interface upvote_post{
    user_id: number;
    post_id: number;
    created_at: Date;
}
export interface upvote_comment{
    user_id: number;
    comment_id: number;
    created_at: Date;
}
