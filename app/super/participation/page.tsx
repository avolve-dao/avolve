import React from 'react';
import DailyClaims from '../../../components/super/DailyClaims';
import Challenges from '../../../components/super/Challenges';

export const metadata = {
  title: 'Daily Participation | Avolve',
  description: 'Claim your daily tokens and complete challenges to boost your progress',
};

export default function ParticipationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Daily Participation</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <DailyClaims />
        </div>
        <div>
          <Challenges />
        </div>
      </div>
      
      <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Participation Guide</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Daily Token Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3">
            <div className="p-3 bg-gradient-to-r from-red-500 to-blue-500 text-white rounded-lg">
              <p className="font-bold">Sunday</p>
              <p>SPD (Superpuzzle Developments)</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-lg">
              <p className="font-bold">Monday</p>
              <p>SHE (Superhuman Enhancements)</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg">
              <p className="font-bold">Tuesday</p>
              <p>PSP (Personal Success Puzzle)</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-lime-500 to-emerald-500 text-white rounded-lg">
              <p className="font-bold">Wednesday</p>
              <p>SSA (Supersociety Advancements)</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg">
              <p className="font-bold">Thursday</p>
              <p>BSP (Business Success Puzzle)</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-lg">
              <p className="font-bold">Friday</p>
              <p>SGB (Supergenius Breakthroughs)</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg">
              <p className="font-bold">Saturday</p>
              <p>SMS (Supermind Superpowers)</p>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Token Hierarchy</h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-medium">GEN (Supercivilization)</span> - Top-level token representing the entire ecosystem
                <ul className="list-circle pl-5 mt-2 space-y-1">
                  <li>
                    <span className="font-medium">SAP (Superachiever)</span> - Individual journey tokens
                    <ul className="list-square pl-5 mt-1 space-y-1">
                      <li><span className="font-medium">PSP (Personal Success Puzzle)</span> - Tuesday</li>
                      <li><span className="font-medium">BSP (Business Success Puzzle)</span> - Thursday</li>
                      <li><span className="font-medium">SMS (Supermind Superpowers)</span> - Saturday</li>
                    </ul>
                  </li>
                  <li>
                    <span className="font-medium">SCQ (Superachievers)</span> - Collective journey tokens
                    <ul className="list-square pl-5 mt-1 space-y-1">
                      <li><span className="font-medium">SPD (Superpuzzle Developments)</span> - Sunday</li>
                      <li><span className="font-medium">SHE (Superhuman Enhancements)</span> - Monday</li>
                      <li><span className="font-medium">SSA (Supersociety Advancements)</span> - Wednesday</li>
                      <li><span className="font-medium">SGB (Supergenius Breakthroughs)</span> - Friday</li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Streak Benefits</h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="mb-3">Maintain your daily claim streak to earn multipliers:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="font-medium">3 days:</span> 1.2x multiplier</li>
              <li><span className="font-medium">5 days:</span> 1.5x multiplier</li>
              <li><span className="font-medium">7 days:</span> 1.7x multiplier</li>
            </ul>
            <p className="mt-3 mb-3">Unlock tokens by:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Maintaining a 3-day streak (unlocks SAP)</li>
              <li>Earning 50 points from challenges (unlocks individual sub-tokens)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
