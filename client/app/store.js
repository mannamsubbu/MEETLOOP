import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../src/features/user/userSlice.js'
import connectionsReducer from '../src/features/connections/connectionsSlice.js'
import messagesReducer from '../src/features/messages/messagesSlice.js'

export const store = configureStore({
    reducer: {
       user: userReducer,
       connections: connectionsReducer,
       messages: messagesReducer
    }
})