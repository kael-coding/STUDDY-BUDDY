import React, { useState } from "react";
import Reply from "./Reply.jsx";

export default function ReplyInput({ reply, postId, commentId }) {
    const [visibleReplyId, setVisibleReplyId] = useState(null);
    const [replyInputs, setReplyInputs] = useState({});

    return (
        <Reply
            reply={reply}
            postId={postId}
            commentId={commentId}
            replyInputs={replyInputs}
            setReplyInputs={setReplyInputs}
            visibleReplyId={visibleReplyId}
            setVisibleReplyId={setVisibleReplyId}
        />
    );
}
