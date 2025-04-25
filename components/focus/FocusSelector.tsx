import { useState } from 'react';
import { RadioGroup } from '@headlessui/react';
import { motion } from 'framer-motion';
import { createClient } from '../../lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Focus = 'individual' | 'collective' | 'ecosystem';

interface FocusOption {
  id: Focus;
  title: string;
  description: string;
  gradient: string;
  frequency: string;
}

const focusOptions: FocusOption[] = [
  {
    id: 'individual',
    title: 'Individual Focus',
    description: 'Accelerate your personal transformation through PSP, BSP, and SMS tokens.',
    gradient: 'from-amber-500 to-yellow-500',
    frequency: '174hz-396hz',
  },
  {
    id: 'collective',
    title: 'Collective Focus',
    description: 'Drive collective transformation through SPD, SHE, SSA, and SBG tokens.',
    gradient: 'from-emerald-500 to-teal-500',
    frequency: '417hz-852hz',
  },
  {
    id: 'ecosystem',
    title: 'Ecosystem Focus',
    description: 'Shape the future of Supercivilization through GEN token governance.',
    gradient: 'from-violet-500 to-purple-500',
    frequency: '963hz',
  },
];

export function FocusSelector() {
  const [selected, setSelected] = useState<Focus>('individual');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleFocusChange = async () => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('user_profiles')
        .upsert({ focus: selected }, { onConflict: 'id' });

      if (error) throw error;

      toast.success('Focus area updated successfully');
      router.refresh();

      // Redirect based on focus
      switch (selected) {
        case 'individual':
          router.push('/superachiever');
          break;
        case 'collective':
          router.push('/superachievers');
          break;
        case 'ecosystem':
          router.push('/supercivilization');
          break;
      }
    } catch (error) {
      console.error('Error updating focus:', error);
      toast.error('Failed to update focus area');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-4 py-16">
      <div className="mx-auto w-full max-w-md">
        <RadioGroup value={selected} onChange={setSelected}>
          <RadioGroup.Label className="sr-only">Focus Area</RadioGroup.Label>
          <div className="space-y-4">
            {focusOptions.map(option => (
              <RadioGroup.Option
                key={option.id}
                value={option.id}
                className={({ active, checked }: { active: boolean; checked: boolean }) =>
                  `${active ? 'ring-2 ring-offset-2 ring-offset-sky-300 ring-white ring-opacity-60' : ''}
                  ${checked ? `bg-gradient-to-r ${option.gradient} text-white` : 'bg-white'}
                  relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-none`
                }
              >
                {({ active, checked }: { active: boolean; checked: boolean }) => (
                  <>
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center">
                        <div className="text-sm">
                          <RadioGroup.Label
                            as="p"
                            className={`font-medium ${checked ? 'text-white' : 'text-gray-900'}`}
                          >
                            {option.title}
                          </RadioGroup.Label>
                          <RadioGroup.Description
                            as="span"
                            className={`inline ${checked ? 'text-white/90' : 'text-gray-500'}`}
                          >
                            <span>{option.description}</span>
                            <span className="block text-xs mt-1">
                              Frequency: {option.frequency}
                            </span>
                          </RadioGroup.Description>
                        </div>
                      </div>
                      {checked && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="shrink-0 text-white"
                        >
                          <CheckIcon className="h-6 w-6" />
                        </motion.div>
                      )}
                    </div>
                  </>
                )}
              </RadioGroup.Option>
            ))}
          </div>
        </RadioGroup>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleFocusChange}
            disabled={isLoading}
            className={`w-full max-w-xs bg-gradient-to-r 
              ${selected === 'individual' ? 'from-amber-500 to-yellow-500' : ''}
              ${selected === 'collective' ? 'from-emerald-500 to-teal-500' : ''}
              ${selected === 'ecosystem' ? 'from-violet-500 to-purple-500' : ''}
            `}
          >
            {isLoading ? 'Updating...' : 'Confirm Focus'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx={12} cy={12} r={12} fill="white" opacity="0.2" />
      <path
        d="M7 13l3 3 7-7"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
