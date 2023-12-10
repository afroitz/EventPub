curl command to test receive endpoint:

curl -X POST -H "Content-Type: application/json" -d '{
    "@context": "https://www.w3.org/ns/activitystreams",
    "type": "Create",
    "id": "https://example.com/event/7890",
    "to": "example.com/actor/1038",
    "actor": "https://example.com/user/johndoe",
    "object": {
        "context": "some context",
        "type": "Event",
        "id": "https://example.com/event/7890",
        "attributedTo": "https://example.com/user/johndoe",
        "name": "Sample Event",
        "content": "This is some event content.",
        "startTime": "2023-12-10T08:00:00Z",
        "endTime": "2023-12-10T17:00:00Z",
        "location": "Conference Center, Room 101",
        "accepted": "",
        "rejected": "",
        "published": "2023-12-01T12:00:00Z",
        "updated": "2023-12-05T15:30:00Z"
    }
}' http://localhost:3001/receive