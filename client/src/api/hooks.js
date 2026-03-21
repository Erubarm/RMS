import { useState, useEffect } from 'react';
import client from './client';

export function useExpositions() {
  const [expositions, setExpositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    client
      .get('/expositions')
      .then((res) => {
        if (!cancelled) setExpositions(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { expositions, loading, error };
}

export function useExposition(id) {
  const [exposition, setExposition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    client
      .get(`/expositions/${id}`)
      .then((res) => {
        if (!cancelled) setExposition(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { exposition, loading, error };
}

export function useExcursion(id) {
  const [excursion, setExcursion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    client
      .get(`/excursions/${id}`)
      .then((res) => {
        if (!cancelled) setExcursion(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { excursion, loading, error };
}

export function useSlots(excursionId, date) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!excursionId || !date) return;
    let cancelled = false;
    setLoading(true);
    client
      .get(`/excursions/${excursionId}/slots`, { params: { date } })
      .then((res) => {
        if (!cancelled) setSlots(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [excursionId, date]);

  return { slots, loading, error };
}

export function useEvents(type, page) {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    client
      .get('/events', { params: { type, page, limit: 10 } })
      .then((res) => {
        if (!cancelled) {
          const items = res.data.data || res.data.items || res.data || [];
          const totalCount = res.data.pagination?.total || res.data.total || 0;
          setEvents((prev) => (page === 1 ? items : [...prev, ...items]));
          setTotal(totalCount);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [type, page]);

  return { events, total, loading, error };
}

export function useBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = () => {
    setLoading(true);
    client
      .get('/bookings/my')
      .then((res) => setBookings(res.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return { bookings, loading, error, refetch: fetchBookings };
}

export function useFaq() {
  const [faq, setFaq] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    client
      .get('/info/faq')
      .then((res) => {
        if (!cancelled) setFaq(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { faq, loading, error };
}
