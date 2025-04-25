'use client';

import React from 'react';
import { Target, Home, Briefcase, Zap, Users, Wind, Lightbulb, GraduationCap } from 'lucide-react';

import { SacredCard } from './sacred-card';
import { SacredButton } from './sacred-button';
import { SacredLayout } from './sacred-layout';
import { SacredIcon } from './sacred-icon';
import { SacredSpiral } from './sacred-spiral';
import { SacredGrid } from './sacred-grid';
import { Tesla369, Tesla369Grid, Tesla369Cycle, Tesla369Triad } from './tesla-369';

/**
 * SacredShowcase component that demonstrates all the sacred geometry
 * components in one place, aligned with the Avolve platform structure.
 */
export function SacredShowcase() {
  return (
    <div className="p-8 space-y-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Sacred Geometry UI Components</h1>
        <p className="text-muted-foreground max-w-2xl">
          These components implement design principles based on sacred geometry, the golden ratio
          (φ), Fibonacci sequence, and Tesla's 3-6-9 patterns that appear throughout nature and
          sacred architecture.
        </p>
      </div>

      {/* Tesla 3-6-9 Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Tesla 3-6-9 Patterns</h2>
        <p className="text-muted-foreground max-w-2xl">
          "If you only knew the magnificence of the 3, 6 and 9, then you would have a key to the
          universe." - Nikola Tesla
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Trinity (3)</h3>
            <div className="flex justify-center">
              <Tesla369Triad section="personal" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              The power of 3 - Creation, beginning, trinity
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-medium">Hexad (6)</h3>
            <div className="flex justify-center">
              <Tesla369 variant="hexad" section="business" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              The power of 6 - Harmony, balance, hexad
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-medium">Nonagon (9)</h3>
            <div className="flex justify-center">
              <Tesla369 variant="nonagon" section="supermind" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              The power of 9 - Completion, fulfillment, nonagon
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Vortex Mathematics</h3>
            <div className="flex justify-center">
              <Tesla369 variant="vortex" section="supercivilization" size="lg" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              The cyclical pattern of energy flow based on digital roots
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-medium">Tesla 3-6-9 Cycle</h3>
            <div className="flex justify-center">
              <Tesla369Cycle section="superachievers" size="lg" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              The continuous cycle of creation, harmony, and completion
            </p>
          </div>
        </div>

        <div className="space-y-3 py-6">
          <h3 className="text-lg font-medium">Tesla 3-6-9 Grid</h3>
          <Tesla369Grid className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-lg">
            <div className="bg-amber-100 dark:bg-amber-950/20 rounded-lg p-3 flex items-center justify-center">
              1
            </div>
            <div className="bg-amber-200 dark:bg-amber-900/20 rounded-lg p-3 flex items-center justify-center">
              2
            </div>
            <div className="bg-amber-300 dark:bg-amber-800/20 rounded-lg p-3 flex items-center justify-center">
              3
            </div>
            <div className="bg-teal-100 dark:bg-teal-950/20 rounded-lg p-3 flex items-center justify-center">
              4
            </div>
            <div className="bg-teal-200 dark:bg-teal-900/20 rounded-lg p-3 flex items-center justify-center">
              5
            </div>
            <div className="bg-teal-300 dark:bg-teal-800/20 rounded-lg p-3 flex items-center justify-center">
              6
            </div>
            <div className="bg-violet-100 dark:bg-violet-950/20 rounded-lg p-3 flex items-center justify-center">
              7
            </div>
            <div className="bg-violet-200 dark:bg-violet-900/20 rounded-lg p-3 flex items-center justify-center">
              8
            </div>
            <div className="bg-violet-300 dark:bg-violet-800/20 rounded-lg p-3 flex items-center justify-center">
              9
            </div>
          </Tesla369Grid>
          <p className="text-sm text-muted-foreground text-center">
            3×3 grid layout based on the 9 digital roots in vortex mathematics
          </p>
        </div>
      </section>

      {/* Sacred Icons Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Sacred Icons</h2>
        <p className="text-muted-foreground">Icons with sacred geometry shapes and proportions</p>

        <SacredGrid variant="golden" columns={3} className="py-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Golden Ratio Icons</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              <SacredIcon
                section="superachiever"
                shape="pentagon"
                icon={<Target className="h-5 w-5" />}
                animated
              />
              <SacredIcon
                section="personal"
                shape="hexagon"
                icon={<Home className="h-5 w-5" />}
                animated
              />
              <SacredIcon
                section="business"
                shape="hexagon"
                icon={<Briefcase className="h-5 w-5" />}
                animated
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Fibonacci Icons</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              <SacredIcon
                section="supermind"
                shape="octagon"
                icon={<Zap className="h-5 w-5" />}
                animated
              />
              <SacredIcon
                section="superachievers"
                shape="pentagon"
                icon={<Users className="h-5 w-5" />}
                animated
              />
              <SacredIcon
                section="supercivilization"
                shape="circle"
                icon={<Wind className="h-5 w-5" />}
                animated
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tesla 3-6-9 Icons</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              <Tesla369 variant="trinity" section="personal" size="sm">
                3
              </Tesla369>
              <Tesla369 variant="hexad" section="business" size="sm">
                6
              </Tesla369>
              <Tesla369 variant="nonagon" section="supermind" size="sm">
                9
              </Tesla369>
            </div>
          </div>
        </SacredGrid>
      </section>

      {/* Sacred Layouts Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Sacred Layouts</h2>
        <p className="text-muted-foreground">
          Layouts based on golden ratio and other sacred proportions
        </p>

        <SacredLayout variant="golden" className="h-64 my-6 border rounded-lg overflow-hidden">
          <div className="bg-amber-100 dark:bg-amber-950/20 flex items-center justify-center">
            <p className="text-center">
              Golden Ratio
              <br />
              38.2%
            </p>
          </div>
          <div className="bg-teal-100 dark:bg-teal-950/20 flex items-center justify-center">
            <p className="text-center">
              Golden Ratio
              <br />
              61.8%
            </p>
          </div>
        </SacredLayout>

        <SacredLayout variant="fibonacci" className="h-32 my-6 border rounded-lg overflow-hidden">
          <div className="bg-violet-100 dark:bg-violet-950/20 flex items-center justify-center">
            <p className="text-xs text-center">
              Fib
              <br />1
            </p>
          </div>
          <div className="bg-purple-100 dark:bg-purple-950/20 flex items-center justify-center">
            <p className="text-xs text-center">
              Fib
              <br />1
            </p>
          </div>
          <div className="bg-fuchsia-100 dark:bg-fuchsia-950/20 flex items-center justify-center">
            <p className="text-xs text-center">
              Fib
              <br />2
            </p>
          </div>
          <div className="bg-pink-100 dark:bg-pink-950/20 flex items-center justify-center">
            <p className="text-xs text-center">
              Fib
              <br />3
            </p>
          </div>
          <div className="bg-rose-100 dark:bg-rose-950/20 flex items-center justify-center">
            <p className="text-xs text-center">
              Fib
              <br />5
            </p>
          </div>
        </SacredLayout>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Tesla Trinity (3)</h3>
            <div className="tesla-trinity-grid h-32 border rounded-lg overflow-hidden">
              <div className="bg-amber-100 dark:bg-amber-950/20 flex items-center justify-center">
                1
              </div>
              <div className="bg-amber-200 dark:bg-amber-900/20 flex items-center justify-center">
                2
              </div>
              <div className="bg-amber-300 dark:bg-amber-800/20 flex items-center justify-center">
                3
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-medium">Tesla Hexad (6)</h3>
            <div className="tesla-hexad-grid h-32 border rounded-lg overflow-hidden">
              <div className="bg-teal-100 dark:bg-teal-950/20 flex items-center justify-center">
                1
              </div>
              <div className="bg-teal-200 dark:bg-teal-900/20 flex items-center justify-center">
                2
              </div>
              <div className="bg-teal-300 dark:bg-teal-800/20 flex items-center justify-center">
                3
              </div>
              <div className="bg-teal-400 dark:bg-teal-700/20 flex items-center justify-center">
                4
              </div>
              <div className="bg-teal-500 dark:bg-teal-600/20 flex items-center justify-center text-white dark:text-teal-200">
                5
              </div>
              <div className="bg-teal-600 dark:bg-teal-500/20 flex items-center justify-center text-white dark:text-teal-200">
                6
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-medium">Tesla Nonagon (9)</h3>
            <div className="tesla-nonagon-grid h-32 border rounded-lg overflow-hidden">
              <div className="bg-violet-100 dark:bg-violet-950/20 flex items-center justify-center">
                1
              </div>
              <div className="bg-violet-200 dark:bg-violet-900/20 flex items-center justify-center">
                2
              </div>
              <div className="bg-violet-300 dark:bg-violet-800/20 flex items-center justify-center">
                3
              </div>
              <div className="bg-violet-400 dark:bg-violet-700/20 flex items-center justify-center">
                4
              </div>
              <div className="bg-violet-500 dark:bg-violet-600/20 flex items-center justify-center text-white dark:text-violet-200">
                5
              </div>
              <div className="bg-violet-600 dark:bg-violet-500/20 flex items-center justify-center text-white dark:text-violet-200">
                6
              </div>
              <div className="bg-violet-700 dark:bg-violet-400/20 flex items-center justify-center text-white dark:text-violet-200">
                7
              </div>
              <div className="bg-violet-800 dark:bg-violet-300/20 flex items-center justify-center text-white dark:text-violet-200">
                8
              </div>
              <div className="bg-violet-900 dark:bg-violet-200/20 flex items-center justify-center text-white dark:text-violet-200">
                9
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sacred Cards Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Sacred Cards</h2>
        <p className="text-muted-foreground">Cards with sacred geometry proportions and patterns</p>

        <SacredGrid variant="phi" columns={3} className="py-6">
          <SacredCard section="personal" className="p-6 h-full">
            <h3 className="text-xl font-semibold mb-2">Personal Success</h3>
            <p className="opacity-80">Health, Wealth, Peace</p>
          </SacredCard>

          <SacredCard section="business" className="p-6 h-full">
            <h3 className="text-xl font-semibold mb-2">Business Success</h3>
            <p className="opacity-80">Users, Admin, Profit</p>
          </SacredCard>

          <SacredCard section="supermind" className="p-6 h-full">
            <h3 className="text-xl font-semibold mb-2">Supermind Powers</h3>
            <p className="opacity-80">Desired, Actions, Results</p>
          </SacredCard>
        </SacredGrid>

        <SacredGrid variant="golden" columns={3} className="py-6">
          <div className="trinity-sacred p-6 rounded-lg text-white">
            <h3 className="text-xl font-semibold mb-2">Trinity (3)</h3>
            <p className="opacity-80">Creation, Beginning, Trinity</p>
            <div className="mt-3 text-t3 font-bold">3</div>
          </div>

          <div className="hexad-sacred p-6 rounded-lg text-white">
            <h3 className="text-xl font-semibold mb-2">Hexad (6)</h3>
            <p className="opacity-80">Harmony, Balance, Hexad</p>
            <div className="mt-3 text-t6 font-bold">6</div>
          </div>

          <div className="nonagon-sacred p-6 rounded-lg text-white">
            <h3 className="text-xl font-semibold mb-2">Nonagon (9)</h3>
            <p className="opacity-80">Completion, Fulfillment, Nonagon</p>
            <div className="mt-3 text-t9 font-bold">9</div>
          </div>
        </SacredGrid>
      </section>

      {/* Sacred Buttons Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Sacred Buttons</h2>
        <p className="text-muted-foreground">Buttons with sacred geometry shapes and proportions</p>

        <div className="flex flex-wrap gap-4 py-6">
          <SacredButton section="personal" sacred="pentagon">
            Personal Success
          </SacredButton>

          <SacredButton section="business" sacred="hexagon">
            Business Success
          </SacredButton>

          <SacredButton section="supermind" sacred="octagon">
            Supermind Powers
          </SacredButton>

          <SacredButton section="superachievers" sacred="golden">
            Superachievers
          </SacredButton>

          <SacredButton section="supercivilization" sacred="none" variant="outline">
            Supercivilization
          </SacredButton>
        </div>
      </section>

      {/* Sacred Spirals Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Sacred Spirals</h2>
        <p className="text-muted-foreground">
          Golden spirals based on the Fibonacci sequence and golden ratio
        </p>

        <SacredGrid variant="fibonacci" columns={3} className="py-6">
          <SacredSpiral section="personal" size={150} />
          <SacredSpiral section="business" size={150} turns={3} />
          <SacredSpiral section="supermind" size={150} turns={5} />
        </SacredGrid>
      </section>

      {/* Sacred Grid Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Sacred Grids</h2>
        <p className="text-muted-foreground">Grid layouts based on sacred proportions</p>

        <div className="space-y-6 py-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Golden Ratio Grid</h3>
            <SacredGrid variant="golden" columns={3} className="h-32">
              <div className="bg-amber-100 dark:bg-amber-950/20 rounded-lg flex items-center justify-center">
                <p className="text-xs">23.6%</p>
              </div>
              <div className="bg-amber-200 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                <p className="text-xs">38.2%</p>
              </div>
              <div className="bg-amber-300 dark:bg-amber-800/20 rounded-lg flex items-center justify-center">
                <p className="text-xs">38.2%</p>
              </div>
            </SacredGrid>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Fibonacci Grid</h3>
            <SacredGrid variant="fibonacci" columns={5} className="h-32">
              <div className="bg-teal-100 dark:bg-teal-950/20 rounded-lg flex items-center justify-center">
                <p className="text-xs">1</p>
              </div>
              <div className="bg-teal-200 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
                <p className="text-xs">1</p>
              </div>
              <div className="bg-teal-300 dark:bg-teal-800/20 rounded-lg flex items-center justify-center">
                <p className="text-xs">2</p>
              </div>
              <div className="bg-teal-400 dark:bg-teal-700/20 rounded-lg flex items-center justify-center">
                <p className="text-xs">3</p>
              </div>
              <div className="bg-teal-500 dark:bg-teal-600/20 rounded-lg flex items-center justify-center text-white dark:text-teal-200">
                <p className="text-xs">5</p>
              </div>
            </SacredGrid>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Phi Grid</h3>
            <SacredGrid variant="phi" columns={4} className="h-32">
              <div className="bg-violet-100 dark:bg-violet-950/20 rounded-lg flex items-center justify-center">
                <p className="text-xs">14.6%</p>
              </div>
              <div className="bg-violet-200 dark:bg-violet-900/20 rounded-lg flex items-center justify-center">
                <p className="text-xs">23.6%</p>
              </div>
              <div className="bg-violet-300 dark:bg-violet-800/20 rounded-lg flex items-center justify-center">
                <p className="text-xs">38.2%</p>
              </div>
              <div className="bg-violet-400 dark:bg-violet-700/20 rounded-lg flex items-center justify-center text-white dark:text-violet-200">
                <p className="text-xs">23.6%</p>
              </div>
            </SacredGrid>
          </div>
        </div>
      </section>
    </div>
  );
}
