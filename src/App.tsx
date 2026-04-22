import { useState, useMemo } from 'react';
import { calculateTakeHome, calculateCarFinance, calculateBond } from './lib/tax-calculator';
import { CopilotChat } from './components/chat';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Banknote, Car, Home, TrendingUp, 
  PiggyBank, Receipt, ShieldCheck, Download, ArrowRight
} from 'lucide-react';

const formatZAR = (val: number) => {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(val);
};

export default function App() {
  const [salaryStr, setSalaryStr] = useState('');
  const [hasLoan, setHasLoan] = useState(false);
  const [wantsTaxSavings, setWantsTaxSavings] = useState(false);
  
  // Dashboard state
  const [extraPayment, setExtraPayment] = useState(1000);
  const [raPercent, setRaPercent] = useState(5);
  
  // Copilot initial query
  const [initialAIQuery, setInitialAIQuery] = useState('');

  const salary = parseFloat(salaryStr.replace(/[^0-9.]/g, '')) || 0;
  
  const takeHomeResults = useMemo(() => {
    return calculateTakeHome(salary, (salary * raPercent) / 100);
  }, [salary, raPercent]);

  const debtResults = useMemo(() => {
    // Arbitrary loan values depending on salary to show realistic examples
    if (salary > 40000) {
      // Show Bond
      return { type: 'bond', results: calculateBond(1500000, extraPayment, 0.1025, 20) };
    } else {
      // Show Car
      return { type: 'car', results: calculateBond(300000, extraPayment, 0.11, 5) };
    }
  }, [salary, extraPayment]);

  const isResultsVisible = salary > 5000;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground pb-24">
      <div className="max-w-[1024px] mx-auto px-6 sm:px-10 flex flex-col">
        {/* Navbar Minimal */}
        <nav className="w-full pt-10 pb-12 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <span className="text-2xl font-extrabold text-primary tracking-[-0.5px]">
               TakeHome<span className="text-accent">Pay</span>.co.za
             </span>
           </div>
           <div className="hidden sm:flex gap-6 text-sm font-medium text-muted-foreground">
             <span>Tax Tables 2026</span>
             <span>Budget Tools</span>
             <span>About</span>
             <span className="text-primary font-bold">Log In</span>
           </div>
        </nav>

        <main className="flex-1">
          {/* HERO SECTION */}
          <div className="max-w-3xl mb-12 flex flex-col justify-center">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[48px] sm:text-[48px] font-extrabold tracking-[-1px] text-[#0F1A14] leading-[1.1]"
            >
              Know your worth. <br />
              Optimize your wealth.
            </motion.h1>

            {/* LARGE INPUT */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(30,77,43,0.08)] border border-border flex flex-col gap-4"
            >
              <div className="w-full">
                 <Label className="text-[12px] uppercase tracking-[1px] font-bold text-accent mb-2 block">Enter Monthly Gross Salary</Label>
                 <div className="flex items-baseline mt-2">
                   <span className="text-[32px] font-semibold text-[#94A3B8] mr-2">R</span>
                   <Input 
                     type="text" 
                     value={salaryStr}
                     onChange={(e) => setSalaryStr(e.target.value)}
                     placeholder="45,000"
                     className="text-[32px] font-semibold text-primary border-none shadow-none focus-visible:ring-0 p-0 h-auto bg-transparent w-full"
                   />
                 </div>
              </div>
            </motion.div>

            <div className="flex flex-wrap gap-3 mt-2">
               <div 
                 onClick={() => setHasLoan(!hasLoan)}
                 className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer border transition-all ${
                   hasLoan ? 'border-accent bg-[#D1FAE5] text-secondary-foreground' : 'bg-secondary text-secondary-foreground border-transparent'
                 }`}
               >
                 Car Balloon Payment
               </div>
               <div 
                 onClick={() => setWantsTaxSavings(!wantsTaxSavings)}
                 className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer border transition-all ${
                   wantsTaxSavings ? 'border-accent bg-[#D1FAE5] text-secondary-foreground' : 'bg-secondary text-secondary-foreground border-transparent'
                 }`}
               >
                 Save on Tax
               </div>
            </div>
          </div>

        <AnimatePresence>
          {isResultsVisible && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-6">
                 
                 {/* CARD 1: THE PAYCHECK */}
                 <Card className="border border-border shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden bg-white p-1">
                   <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] flex items-center justify-center text-2xl shrink-0">
                        💵
                      </div>
                      <div className="flex-1">
                        <div className="text-[12px] font-bold text-muted-foreground uppercase mb-1">Your Paycheck</div>
                        <div className="text-[24px] font-bold text-primary">{formatZAR(takeHomeResults.takeHome)}</div>
                        <div className="text-[12px] text-accent font-medium mt-1">Net Income after PAYE ({formatZAR(takeHomeResults.monthlyTax)}) & UIF</div>
                      </div>
                   </CardContent>
                 </Card>

                 {/* CARD 2 & 3 GRID */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   
                    {/* CARD 2: DEBT CRUSHER */}
                    <Card className="border border-border shadow-[0_2px_10px_rgba(0,0,0,0.02)] bg-white p-1">
                      <CardContent className="p-4 sm:p-5">
                         <div className="flex items-center gap-4 mb-4">
                           <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center text-xl shrink-0">
                             🚜
                           </div>
                           <div>
                             <div className="text-[12px] font-bold text-muted-foreground uppercase mb-1">Debt Crusher</div>
                             <div className="text-[20px] font-bold text-primary">{formatZAR(extraPayment)} Extra</div>
                           </div>
                         </div>
                         <div className="mb-2">
                           <p className="text-[12px] text-accent font-medium">Interest Saved: <strong className="text-primary">{formatZAR(debtResults.results.interestSaved)}</strong></p>
                         </div>
                         <Slider 
                           value={[extraPayment]} 
                           onValueChange={(val) => setExtraPayment(val[0])} 
                           max={5000} 
                           step={100} 
                           className="py-2"
                         />
                      </CardContent>
                    </Card>

                    {/* CARD 3: WEALTH BUILDER */}
                    <Card className="border border-border shadow-[0_2px_10px_rgba(0,0,0,0.02)] bg-white p-1">
                      <CardContent className="p-4 sm:p-5">
                         <div className="flex items-center gap-4 mb-4">
                           <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] flex items-center justify-center text-xl shrink-0">
                             📈
                           </div>
                           <div>
                             <div className="text-[12px] font-bold text-muted-foreground uppercase mb-1">Wealth Builder</div>
                             <div className="text-[20px] font-bold text-primary">{raPercent}% RA</div>
                           </div>
                         </div>
                         <div className="mb-2">
                           <p className="text-[12px] text-accent font-medium">Tax Saved: <strong className="text-primary">{formatZAR(calculateTakeHome(salary, 0).annualTax - takeHomeResults.annualTax)}</strong></p>
                         </div>
                         <Slider 
                           value={[raPercent]} 
                           onValueChange={(val) => setRaPercent(val[0])} 
                           max={25} 
                           step={1} 
                           className="py-2"
                         />
                      </CardContent>
                    </Card>

                 </div>

                 {/* MONETIZATION ROW */}
                 <div className="flex flex-col sm:flex-row gap-4 pt-4 pb-8">
                    <Button className="flex-1 bg-primary hover:bg-[#153a20] text-white rounded-xl h-14 font-bold text-[14px]">
                      Get My Tax Optimization Report (R99)
                    </Button>
                    <Button variant="outline" className="flex-1 rounded-xl h-14 bg-white border-primary text-primary hover:bg-neutral-50 font-bold text-[14px]">
                      Refinance My Car Balloon
                    </Button>
                 </div>

              </div>

              {/* RIGHT COL: COPILOT CHAT */}
              <div className="lg:col-span-1">
                 <div className="sticky top-10">
                   <CopilotChat initialMessage={initialAIQuery} />
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
