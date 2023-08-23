import resource from "../resource_config/resource";
import request from "../resource_config/config";

export const Sync = resource("/api/sync", request);
export const isOwner = resource("/api/isOwner/:eventId/:userId", request);
export const syncParticipants = resource(
  "/api/syncParticipants/:appname/:modulename/:entityname/:id",
  request
);
export const roster = resource(
  "/api/roster/:appname/:modulename/:entityname/:id",
  request
);
export const syncGetEvents = resource(
  "/api/getEvents/:appname/:modulename/:entityname",
  request
);
export const syncNotification = resource(
  "/api/syncNotification/:appname/:modulename/:entityname",
  request
);
export const SyncUpdateEvent = resource(
  "/api/syncUpdateEvent/:appname/:modulename/:entityname/:id",
  request
);
export const deleteEvent = resource(
  "/api/deleteEvent/:appname/:modulename/:entityname/:id",
  request
);
