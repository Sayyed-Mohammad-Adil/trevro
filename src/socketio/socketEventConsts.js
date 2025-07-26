/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Author:     Chris Brame
 *  Updated:    6/25/22 6:48 PM
 *  Copyright (c) 2014-2022. Trevyro, Inc (Chris Brame) All rights reserved.
 */

const exported = {}

// GLOBAL
exported.UI_ONLINE_STATUS_UPDATE = '$trevyro:global:ui:online_status:update'
exported.UI_ONLINE_STATUS_SET = '$trevyro:global:ui:online_status:set'
exported.USERS_UPDATE = '$trevyro:users:update'

// ROLES
exported.ROLES_FLUSH = '$trevyro:roles:flush'

// TICKETS
exported.TICKETS_CREATED = '$trevyro:tickets:created'
exported.TICKETS_UPDATE = '$trevyro:tickets:update'
// --- SUB TICKET EVENTS
exported.TICKETS_UI_STATUS_UPDATE = '$trevyro:tickets:ui:status:update'
exported.TICKETS_STATUS_SET = '$trevyro:tickets:status:set'

exported.TICKETS_UI_GROUP_UPDATE = '$trevyro:tickets:ui:group:update'
exported.TICKETS_GROUP_SET = '$trevyro:tickets:group:set'

exported.TICKETS_UI_TYPE_UPDATE = '$trevyro:tickets:ui:type:update'
exported.TICKETS_TYPE_SET = '$trevyro:tickets:type:set'

exported.TICKETS_UI_PRIORITY_UPDATE = '$trevyro:tickets:ui:priority:update'
exported.TICKETS_PRIORITY_SET = '$trevyro:tickets:priority:set'

exported.TICKETS_UI_DUEDATE_UPDATE = '$trevyro:tickets:ui:duedate:update'
exported.TICKETS_DUEDATE_SET = '$trevyro:tickets:duedate:set'

exported.TICKETS_UI_TAGS_UPDATE = '$trevyro:tickets:ui:tags:update'
exported.TICKETS_TAGS_SET = '$trevyro:tickets:tags:set'

exported.TICKETS_ASSIGNEE_LOAD = '$trevyro:tickets:assignee:load'
exported.TICKETS_ASSIGNEE_SET = '$trevyro:tickets:assignee:set'
exported.TICKETS_ASSIGNEE_CLEAR = '$trevyro:tickets:assignee:clear'
exported.TICKETS_ASSIGNEE_UPDATE = '$trevyro:tickets:assignee: update'

exported.TICKETS_ISSUE_SET = '$trevyro:tickets:issue:set'

exported.TICKETS_COMMENT_NOTE_REMOVE = '$trevyro:tickets:comment_note:remove'
exported.TICKETS_COMMENT_NOTE_SET = '$trevyro:tickets:comment_note:set'

exported.TICKETS_UI_ATTACHMENTS_UPDATE = '$trevyro:tickets:ui:attachments:update'

// ACCOUNTS
exported.ACCOUNTS_UI_PROFILE_IMAGE_UPDATE = '$trevyro:accounts:ui:profile_image:update'

// NOTIFICATIONS
exported.NOTIFICATIONS_UPDATE = '$trevyro:notifications:update'
exported.NOTIFICATIONS_MARK_READ = '$trevyro:notifications:mark_read'
exported.NOTIFICATIONS_CLEAR = '$trevyro:notifications:clear'

// MESSAGES
exported.MESSAGES_SEND = '$trevyro:messages:send'
exported.MESSAGES_UI_RECEIVE = '$trevyro:messages:ui:receive'
exported.MESSAGES_USER_TYPING = '$trevyro:messages:user_typing'
exported.MESSAGES_UI_USER_TYPING = '$trevyro:messages:ui:user_typing'
exported.MESSAGES_SPAWN_CHAT_WINDOW = '$trevyro:messages:spawn_chat_window'
exported.MESSAGES_UI_SPAWN_CHAT_WINDOW = '$trevyro:messages:ui:spawn_chat_window'
exported.MESSAGES_SAVE_CHAT_WINDOW = '$trevyro:messages:save_chat_window'
exported.MESSAGES_SAVE_CHAT_WINDOW_COMPLETE = '$trevyro:messages:save_chat_window_complete'
exported.MESSAGES_UPDATE_UI_CONVERSATION_NOTIFICATIONS = '$trevyro:messages:ui:conversation_notifications:update'

// NOTICES
exported.NOTICE_SHOW = '$trevyro:notice:show'
exported.NOTICE_UI_SHOW = '$trevyro:notice:ui:show'
exported.NOTICE_CLEAR = '$trevyro:notice:clear'
exported.NOTICE_UI_CLEAR = '$trevyro:notice:ui:clear'

// BACKUP / RESTORE
exported.BACKUP_RESTORE_SHOW_OVERLAY = '$trevyro:backup_restore:show_overlay'
exported.BACKUP_RESTORE_UI_SHOW_OVERLAY = '$trevyro:backup_restore:ui:show_overlay'
exported.BACKUP_RESTORE_COMPLETE = '$trevyro:backup_restore:complete'
exported.BACKUP_RESTORE_UI_COMPLETE = '$trevyro:backup_restore:ui:complete'

module.exports = exported
