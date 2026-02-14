// Nutrition functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeNutrition();
});

function initializeNutrition() {
    loadHydration();
}

function generateMealPlan() {
    const sessions = Storage.get('sessions') || [];
    const today = new Date();
    
    // Get next 7 days of sessions
    const weekSessions = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = Helpers.formatDate(date);
        const session = sessions.find(s => s.date === dateStr);
        weekSessions.push({
            date: dateStr,
            dayName: date.toLocaleDateString('en-GB', { weekday: 'long' }),
            session: session || null
        });
    }

    const container = document.getElementById('weeklyMealPlan');
    
    container.innerHTML = `
        <div style="margin-top: 1.5rem;">
            ${weekSessions.map(day => {
                const isHardTraining = day.session && (day.session.type === 'track' || day.session.type === 'race');
                const isGym = day.session && day.session.type === 'gym';
                const isRecovery = !day.session || day.session.type === 'recovery';
                
                return `
                    <div style="padding: 1rem; background: var(--bg-secondary); border-radius: 0.5rem; margin: 0.75rem 0;">
                        <h4 style="margin: 0 0 0.5rem 0;">${day.dayName} - ${new Date(day.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</h4>
                        <p style="color: var(--text-secondary); margin-bottom: 0.75rem;">
                            ${isHardTraining ? '💪 Hard Training Day - High Carb' : isGym ? '🏋️ Gym Day - Moderate Carb, High Protein' : '🧘 Recovery Day - Moderate Carb'}
                        </p>
                        <div style="font-size: 0.9375rem;">
                            ${isHardTraining ? `
                                <p><strong>Breakfast:</strong> Porridge Power Bowl (oats, banana, peanut butter, berries)</p>
                                <p><strong>Lunch:</strong> Chicken & Rice Power Bowl</p>
                                <p><strong>Dinner:</strong> Salmon & Sweet Potato with vegetables</p>
                                <p><strong>Snacks:</strong> Banana + protein shake, Greek yogurt + honey</p>
                            ` : isGym ? `
                                <p><strong>Breakfast:</strong> Protein Scramble (4 eggs, toast, avocado)</p>
                                <p><strong>Lunch:</strong> Beef Mince Burrito Bowl</p>
                                <p><strong>Post-Gym:</strong> Protein shake + banana within 30min</p>
                                <p><strong>Dinner:</strong> Turkey Stir-Fry with noodles</p>
                                <p><strong>Snacks:</strong> Peanut butter + rice cakes, Greek yogurt</p>
                            ` : `
                                <p><strong>Breakfast:</strong> Greek Yogurt Bowl with granola</p>
                                <p><strong>Lunch:</strong> Grilled Chicken Salad with small portion quinoa</p>
                                <p><strong>Dinner:</strong> Lean Beef & Roasted Vegetables</p>
                                <p><strong>Snacks:</strong> Trail mix, rice cakes with jam</p>
                            `}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function loadHydration() {
    const hydration = Storage.get('hydration') || {};
    const today = Helpers.getToday();
    const todayWater = hydration[today] || 0;
    
    updateHydrationDisplay(todayWater);
}

function updateHydrationDisplay(ml) {
    const target = 2500; // 2.5L
    const glasses = Math.floor(target / 250); // 10 glasses
    const filled = Math.floor(ml / 250);
    
    const container = document.getElementById('waterGlasses');
    container.innerHTML = '';
    
    for (let i = 0; i < glasses; i++) {
        const glass = document.createElement('div');
        glass.className = 'water-glass' + (i < filled ? ' filled' : '');
        container.appendChild(glass);
    }
    
    document.getElementById('hydrationTotal').textContent = `${ml}ml / ${target}ml`;
}

function addWater() {
    const hydration = Storage.get('hydration') || {};
    const today = Helpers.getToday();
    const current = hydration[today] || 0;
    
    hydration[today] = current + 250;
    Storage.set('hydration', hydration);
    
    updateHydrationDisplay(hydration[today]);
}

function resetWater() {
    const hydration = Storage.get('hydration') || {};
    const today = Helpers.getToday();
    
    hydration[today] = 0;
    Storage.set('hydration', hydration);
    
    updateHydrationDisplay(0);
}

function generateShoppingList() {
    const container = document.getElementById('shoppingList');
    
    const staples = [
        { item: 'Tesco Oats (1kg)', price: '£1.00' },
        { item: 'Bananas (6)', price: '£0.90' },
        { item: 'Eggs (15)', price: '£2.50' },
        { item: 'Chicken Breast (1kg)', price: '£5.00' },
        { item: 'Basmati Rice (1kg)', price: '£1.50' },
        { item: 'Sweet Potatoes (1kg)', price: '£1.20' },
        { item: 'Mixed Vegetables (frozen)', price: '£1.00' },
        { item: 'Greek Yogurt (500g)', price: '£1.50' },
        { item: 'Tesco Peanut Butter', price: '£1.80' },
        { item: 'Wholemeal Bread', price: '£1.00' },
        { item: 'Salmon Fillets (2)', price: '£4.50' },
        { item: 'Turkey Breast Strips', price: '£3.00' },
        { item: '5% Fat Mince (500g)', price: '£2.50' },
        { item: 'Tuna Tins (4)', price: '£3.00' },
        { item: 'Mixed Berries (frozen)', price: '£2.00' },
        { item: 'Broccoli', price: '£0.80' },
        { item: 'Peppers (3)', price: '£1.50' },
        { item: 'Pasta (500g)', price: '£0.80' },
        { item: 'Black Beans (tin)', price: '£0.60' },
        { item: 'Avocados (2)', price: '£1.60' }
    ];
    
    const total = staples.reduce((sum, item) => {
        const price = parseFloat(item.price.replace('£', ''));
        return sum + price;
    }, 0);
    
    container.innerHTML = `
        <div style="margin-top: 1.5rem; padding: 1.5rem; background: var(--bg-secondary); border-radius: 0.75rem;">
            <h3 style="margin: 0 0 1rem 0;">Weekly Essentials</h3>
            <div style="display: grid; grid-template-columns: 1fr auto; gap: 0.5rem; margin-bottom: 1rem;">
                ${staples.map(item => `
                    <div style="padding: 0.5rem 0; border-bottom: 1px solid var(--border);">
                        ${item.item}
                    </div>
                    <div style="padding: 0.5rem 0; border-bottom: 1px solid var(--border); text-align: right; font-weight: 600;">
                        ${item.price}
                    </div>
                `).join('')}
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 1rem; border-top: 2px solid var(--primary); font-size: 1.125rem; font-weight: 700;">
                <span>Total</span>
                <span>£${total.toFixed(2)}</span>
            </div>
            <p style="margin-top: 1rem; color: var(--text-secondary); font-size: 0.9375rem;">
                This covers your main meals for the week. Add snacks, protein powder, and fresh produce as needed.
            </p>
        </div>
    `;
}
