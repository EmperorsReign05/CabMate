// src/components/RideChat.jsx

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Box, TextField, Button, List, ListItem, ListItemText, Typography, Paper } from '@mui/material';

const RideChat = ({ rideId, session, creatorId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [profiles, setProfiles] = useState({});
  const messagesEndRef = useRef(null);

  // This function will be called repeatedly to get new messages
  const fetchMessagesAndProfiles = async () => {
    // Fetch all messages for the ride
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .select('*')
      .eq('ride_id', rideId)
      .order('created_at');
    
    if (messageError) {
      console.error('Error fetching messages:', messageError);
      return;
    }

    // Get the user IDs from the new messages
    const userIds = [...new Set(messageData.map(msg => msg.user_id))];
    
    // Fetch profiles for any users we haven't seen before
    const newProfilesToFetch = userIds.filter(id => !profiles[id]);
    if (newProfilesToFetch.length > 0) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', newProfilesToFetch);
      
      if (!profileError && profileData) {
        const profileMap = profileData.reduce((acc, profile) => {
          acc[profile.id] = profile.full_name;
          return acc;
        }, {});
        setProfiles(prev => ({ ...prev, ...profileMap }));
      }
    }
    setMessages(messageData);
  };

  // --- NEW POLLING LOGIC ---
  useEffect(() => {
    // Fetch messages immediately when the component loads
    fetchMessagesAndProfiles();

    // Set up an interval to fetch messages every 5 seconds
    const interval = setInterval(() => {
      fetchMessagesAndProfiles();
    }, 5000); // 5000 milliseconds = 5 seconds

    // Clean up the interval when the component is unmounted
    return () => clearInterval(interval);
  }, [rideId]); // This effect runs only when the rideId changes

  // Scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase
      .from('messages')
      .insert({ ride_id: rideId, user_id: session.user.id, content: newMessage });

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
      // After sending, immediately fetch the latest messages
      fetchMessagesAndProfiles();
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Ride Chat
      </Typography>
      <Box sx={{ height: '300px', overflowY: 'auto', mb: 2, border: '1px solid #e0e0e0', p: 1, borderRadius: 1 }}>
        <List>
          {messages.map((message) => {
            const isYou = message.user_id === session.user.id;
            const isCreator = message.user_id === creatorId;
            const userName = profiles[message.user_id] || 'A user';
            
            return (
              <ListItem key={message.id} sx={{ justifyContent: isYou ? 'flex-end' : 'flex-start' }}>
                <Box sx={{ maxWidth: '70%' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: isYou ? 'right' : 'left', display: 'block' }}>
                    {isYou ? 'You' : `${userName}${isCreator ? ' (Creator)' : ''}`}
                  </Typography>
                  <Box sx={{ bgcolor: isYou ? 'primary.main' : 'grey.200', color: isYou ? 'white' : 'black', p: 1.5, borderRadius: 2 }}>
                    <ListItemText primary={message.content} />
                  </Box>
                </Box>
              </ListItem>
            );
          })}
          <div ref={messagesEndRef} />
        </List>
      </Box>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex' }}>
        <TextField
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          size="small"
        />
        <Button type="submit" variant="contained" sx={{ ml: 1 }}>Send</Button>
      </Box>
    </Paper>
  );
};

export default RideChat;