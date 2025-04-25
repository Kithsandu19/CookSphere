import React, { useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import axios from 'axios';

const Comment = ({ comment, currentUserId, onDelete, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(comment.content);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/interactions/comments/${comment.id}?userId=${currentUserId}`);
            onDelete(comment.id);
        } catch (err) {
            setError('Failed to delete comment');
        }
    };

    const handleUpdate = async () => {
        try {
            const response = await axios.put(`/api/interactions/comments/${comment.id}`, editedContent, {
                params: { userId: currentUserId }
            });
            onUpdate(response.data);
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update comment');
        }
    };

    return (
        <Card className="mb-2">
            <Card.Body>
                {error && <div className="text-danger">{error}</div>}
                {isEditing ? (
                    <Form.Group>
                        <Form.Control
                            as="textarea"
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                        />
                        <Button variant="primary" onClick={handleUpdate} className="mt-2">
                            Save
                        </Button>
                        <Button variant="secondary" onClick={() => setIsEditing(false)} className="mt-2 ms-2">
                            Cancel
                        </Button>
                    </Form.Group>
                ) : (
                    <>
                        <Card.Text>{comment.content}</Card.Text>
                        <small className="text-muted">
                            By {comment.user.username} on {new Date(comment.createdAt).toLocaleString()}
                        </small>
                        {(currentUserId === comment.user.id || currentUserId === comment.post.user.id) && (
                            <div className="mt-2">
                                {currentUserId === comment.user.id && (
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => setIsEditing(true)}
                                        className="me-2"
                                    >
                                        Edit
                                    </Button>
                                )}
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </Card.Body>
        </Card>
    );
};

export default Comment; 