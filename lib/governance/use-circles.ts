import { useCallback, useState } from 'react';
import { Circle, CircleMember } from './types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function useCircles() {
  const supabase = createClientComponentClient();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [circleMembers, setCircleMembers] = useState<Record<string, CircleMember[]>>({});

  const loadCircles = useCallback(async () => {
    const { data, error } = await supabase.from('circles').select('*');
    if (!error && data) setCircles(data);
  }, [supabase]);

  const loadCircleMembers = useCallback(async (circleId: string) => {
    const { data, error } = await supabase.from('circle_members').select('*').eq('circle_id', circleId);
    if (!error && data) setCircleMembers(members => ({ ...members, [circleId]: data }));
  }, [supabase]);

  const joinCircle = useCallback(async (circleId: string) => {
    await supabase.from('circle_members').insert({ circle_id: circleId });
    await loadCircleMembers(circleId);
  }, [supabase, loadCircleMembers]);

  const leaveCircle = useCallback(async (circleId: string) => {
    await supabase.from('circle_members').delete().eq('circle_id', circleId);
    await loadCircleMembers(circleId);
  }, [supabase, loadCircleMembers]);

  return {
    circles,
    circleMembers,
    loadCircles,
    loadCircleMembers,
    joinCircle,
    leaveCircle
  };
}
