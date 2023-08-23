export const initialState = {
  isDrawerOpen: true,
  snackBar: {
    open: false,
    message: "",
  },
  backDrop: {
    open: false,
    message: "",
  },
  map: null,
  summarySubLayers: {},
  summaryLegendState: {},
  summaryClustering: {},
  summaryMapPosition: null,
  lastInteractedPosition: null,
  triggerToSave: false,
  systemTypes: undefined,
  fullScreenSize: true,
  sidebarClickStatus: true,
  previousEntity: undefined,
};
