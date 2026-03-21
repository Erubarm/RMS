import { create } from 'zustand';

const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  bookings: [],
  setBookings: (bookings) => set({ bookings }),

  popout: null,
  setPopout: (popout) => set({ popout }),
}));

export default useStore;
