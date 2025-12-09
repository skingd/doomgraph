// US Debt Crisis Chart - DoomGraph
// Data based on Treasury, CBO, Federal Reserve, IMF, and BEA sources

// Historical data (in billions USD)
// Sources: 
// - GDP: Bureau of Economic Analysis (BEA), FRED (Federal Reserve Economic Data)
// - Debt & Interest: US Treasury Department Fiscal Data
// - Budget: Congressional Budget Office (CBO)
// - Projections: IMF World Economic Outlook, CBO Long-term Budget Outlook
const historicalData = {
    years: [1980, 1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020, 2024],
    gdp: [2857, 4339, 5963, 7640, 10250, 13039, 14992, 18238, 21060, 28780], // BEA/FRED
    totalDebt: [908, 1823, 3233, 4974, 5674, 7933, 13562, 18151, 27748, 35500],
    federalSpending: [591, 946, 1253, 1516, 1789, 2472, 3457, 3688, 6552, 6700],
    interestPayments: [53, 129, 184, 232, 223, 184, 196, 223, 345, 882],
    defenseBudget: [134, 253, 299, 272, 294, 495, 691, 596, 714, 886],
    medicare: [32, 65, 98, 160, 197, 299, 452, 546, 776, 874],
    socialSecurity: [118, 186, 248, 335, 409, 523, 706, 882, 1096, 1461]
};

// Current assumptions from the data
const baseAssumptions = {
    currentDebt: 35500, // billions
    currentGDP: 28780, // billions (Q2 2024, BEA)
    baseInterestRate: 5, // %
    annualSpendingGrowth: 0.10, // 10%
    annualDebtGrowth: 0.08, // 8% base growth
    annualGDPGrowth: 0.025, // 2.5% (IMF baseline projection)
    currentYear: 2024
};

let chart;

// Calculate projections based on interest rate
function calculateProjections(interestRate) {
    const projectedYears = [];
    const projectedSpending = [];
    const projectedInterest = [];
    const projectedDefense = [];
    const projectedMedicare = [];
    const projectedSocialSecurity = [];
    const projectedGDP = [];
    const projectedFederalRevenue = [];
    
    let currentDebt = baseAssumptions.currentDebt;
    let currentSpending = 6700; // 2024 spending in billions
    let currentDefense = 886;
    let currentMedicare = 874;
    let currentSocialSecurity = 1461;
    let currentGDP = baseAssumptions.currentGDP;
    
    // Interest growth rate increases with higher rates
    const interestGrowthMultiplier = 1 + (interestRate - 5) * 0.05;
    
    for (let year = 2024; year <= 2040; year++) {
        projectedYears.push(year);
        
        // Calculate interest payment based on rate
        const interestPayment = (currentDebt * (interestRate / 100));
        
        // Federal revenue ~17-18% of GDP historically
        const federalRevenue = currentGDP * 0.175;
        
        projectedSpending.push(currentSpending);
        projectedInterest.push(interestPayment);
        projectedDefense.push(currentDefense);
        projectedMedicare.push(currentMedicare);
        projectedSocialSecurity.push(currentSocialSecurity);
        projectedGDP.push(currentGDP);
        projectedFederalRevenue.push(federalRevenue);
        
        // Grow values for next year
        currentSpending *= (1 + baseAssumptions.annualSpendingGrowth);
        currentDebt *= (1 + baseAssumptions.annualDebtGrowth + (interestRate - 5) * 0.01);
        currentDefense *= 1.03; // 3% defense growth
        currentMedicare *= 1.07; // 7% Medicare growth
        currentSocialSecurity *= 1.05; // 5% SS growth
        currentGDP *= (1 + baseAssumptions.annualGDPGrowth); // IMF projected growth
    }
    
    return {
        years: projectedYears,
        spending: projectedSpending,
        interest: projectedInterest,
        defense: projectedDefense,
        medicare: projectedMedicare,
        socialSecurity: projectedSocialSecurity,
        gdp: projectedGDP,
        federalRevenue: projectedFederalRevenue
    };
}

// Combine historical and projected data
function getFullDataset(interestRate) {
    const projections = calculateProjections(interestRate);
    
    // Combine historical (up to 2023) with projections (2024+)
    const historicalYearsFiltered = historicalData.years.filter(y => y < 2024);
    const historicalSpendingFiltered = historicalData.federalSpending.slice(0, historicalYearsFiltered.length);
    const historicalInterestFiltered = historicalData.interestPayments.slice(0, historicalYearsFiltered.length);
    const historicalDefenseFiltered = historicalData.defenseBudget.slice(0, historicalYearsFiltered.length);
    const historicalMedicareFiltered = historicalData.medicare.slice(0, historicalYearsFiltered.length);
    const historicalSSFiltered = historicalData.socialSecurity.slice(0, historicalYearsFiltered.length);
    const historicalGDPFiltered = historicalData.gdp.slice(0, historicalYearsFiltered.length);
    // Calculate historical federal revenue as ~17.5% of GDP
    const historicalRevenueFiltered = historicalGDPFiltered.map(gdp => gdp * 0.175);
    
    return {
        years: [...historicalYearsFiltered, ...projections.years],
        spending: [...historicalSpendingFiltered, ...projections.spending],
        interest: [...historicalInterestFiltered, ...projections.interest],
        defense: [...historicalDefenseFiltered, ...projections.defense],
        medicare: [...historicalMedicareFiltered, ...projections.medicare],
        socialSecurity: [...historicalSSFiltered, ...projections.socialSecurity],
        gdp: [...historicalGDPFiltered, ...projections.gdp],
        federalRevenue: [...historicalRevenueFiltered, ...projections.federalRevenue]
    };
}

// Find crossover year (interest exceeds federal revenue = insolvency)
function findCrossoverYear(data) {
    for (let i = 0; i < data.years.length; i++) {
        if (data.interest[i] >= data.federalRevenue[i]) {
            return data.years[i];
        }
    }
    return 'Beyond 2040';
}

// Find when interest exceeds 50% of revenue (danger zone)
function findDangerYear(data) {
    for (let i = 0; i < data.years.length; i++) {
        if (data.interest[i] >= data.federalRevenue[i] * 0.5) {
            return data.years[i];
        }
    }
    return 'Beyond 2040';
}

// Create insolvency zone data (area between lines when interest > spending)
function createInsolvencyData(data) {
    return data.years.map((year, i) => {
        if (data.interest[i] >= data.spending[i]) {
            return data.interest[i];
        }
        return null;
    });
}

// Update stats display
function updateStats(interestRate, data) {
    const immediateInterest = (35500 * (interestRate / 100));
    const currentRevenue = 28780 * 0.175; // Federal revenue as % of GDP
    const budgetPercent = ((immediateInterest / currentRevenue) * 100).toFixed(1);
    const crossoverYear = findCrossoverYear(data);
    const dangerYear = findDangerYear(data);
    
    document.getElementById('currentInterest').textContent = `$${immediateInterest.toFixed(0)} Billion`;
    document.getElementById('budgetPercent').textContent = `${budgetPercent}%`;
    document.getElementById('crossoverYear').textContent = typeof crossoverYear === 'number' ? `~${crossoverYear}` : crossoverYear;
    
    // Update danger year if element exists
    const dangerElement = document.getElementById('dangerYear');
    if (dangerElement) {
        dangerElement.textContent = typeof dangerYear === 'number' ? `~${dangerYear}` : dangerYear;
    }
}

// Initialize chart
function initChart() {
    const ctx = document.getElementById('debtChart').getContext('2d');
    const initialRate = 7.5;
    const data = getFullDataset(initialRate);
    
    // Custom plugin to fill insolvency zone - everything to right of intersection
    const insolvencyFillPlugin = {
        id: 'insolvencyFill',
        afterDatasetsDraw(chart) {
            const { ctx, scales, data: chartData } = chart;
            const federalRevenue = chartData.datasets[0].data; // Federal Revenue
            const interest = chartData.datasets[1].data; // Interest Payments
            const xScale = scales.x;
            const yScale = scales.y;
            const labels = chartData.labels;
            
            // Find the exact intersection point
            let intersectIdx = -1;
            let t = 0;
            
            for (let i = 0; i < federalRevenue.length - 1; i++) {
                if (interest[i] < federalRevenue[i] && interest[i + 1] >= federalRevenue[i + 1]) {
                    // Linear interpolation to find exact crossing point
                    const rev1 = federalRevenue[i], rev2 = federalRevenue[i + 1];
                    const int1 = interest[i], int2 = interest[i + 1];
                    t = (rev1 - int1) / ((int2 - int1) - (rev2 - rev1));
                    intersectIdx = i;
                    break;
                }
            }
            
            if (intersectIdx >= 0) {
                // Get pixel positions using index
                const x1 = xScale.getPixelForValue(intersectIdx);
                const x2 = xScale.getPixelForValue(intersectIdx + 1);
                const intersectX = x1 + t * (x2 - x1);
                
                const rev1 = federalRevenue[intersectIdx];
                const rev2 = federalRevenue[intersectIdx + 1];
                const intersectYValue = rev1 + t * (rev2 - rev1);
                const intersectY = yScale.getPixelForValue(intersectYValue);
                
                ctx.save();
                
                // Fill the ENTIRE chart area to the right of intersection with red
                const chartRight = xScale.getPixelForValue(labels.length - 1);
                ctx.fillStyle = 'rgba(139, 0, 0, 0.2)'; // Dark red background
                ctx.fillRect(intersectX, yScale.top, chartRight - intersectX + 20, yScale.bottom - yScale.top);
                
                // Fill the area between interest and revenue from intersection to end
                ctx.fillStyle = 'rgba(231, 76, 60, 0.4)';
                ctx.beginPath();
                
                // Start at intersection point
                ctx.moveTo(intersectX, intersectY);
                
                // Draw along interest line (top) to the end
                for (let i = intersectIdx + 1; i < labels.length; i++) {
                    ctx.lineTo(xScale.getPixelForValue(i), yScale.getPixelForValue(interest[i]));
                }
                
                // Draw back along revenue line (bottom) to intersection
                for (let i = labels.length - 1; i > intersectIdx; i--) {
                    ctx.lineTo(xScale.getPixelForValue(i), yScale.getPixelForValue(federalRevenue[i]));
                }
                
                ctx.closePath();
                ctx.fill();
                
                // Draw bold vertical line at intersection
                ctx.strokeStyle = '#e74c3c';
                ctx.lineWidth = 4;
                ctx.setLineDash([]);
                ctx.beginPath();
                ctx.moveTo(intersectX, yScale.top);
                ctx.lineTo(intersectX, yScale.bottom);
                ctx.stroke();
                
                // Add "INSOLVENCY" label at the top
                ctx.fillStyle = '#e74c3c';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'left';
                ctx.fillText('⚠ INSOLVENCY', intersectX + 10, yScale.top + 25);
                
                // Calculate and add year label
                const intersectYear = labels[intersectIdx] + t * (labels[intersectIdx + 1] - labels[intersectIdx]);
                ctx.font = 'bold 14px Arial';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(`Year: ${Math.round(intersectYear)}`, intersectX + 10, yScale.top + 45);
                
                ctx.restore();
            }
        }
    };
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.years,
            datasets: [
                {
                    label: 'Federal Revenue',
                    data: data.federalRevenue,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.3,
                    pointRadius: 2,
                    pointHoverRadius: 6,
                    yAxisID: 'y'
                },
                {
                    label: 'Interest Payments',
                    data: data.interest,
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.3,
                    pointRadius: 2,
                    pointHoverRadius: 6,
                    yAxisID: 'y'
                },
                {
                    label: 'Defense Budget',
                    data: data.defense,
                    borderColor: '#2ecc71',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    yAxisID: 'y'
                },
                {
                    label: 'Medicare',
                    data: data.medicare,
                    borderColor: '#9b59b6',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    yAxisID: 'y'
                },
                {
                    label: 'Social Security',
                    data: data.socialSecurity,
                    borderColor: '#f39c12',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    yAxisID: 'y'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 26, 37, 0.95)',
                    titleColor: '#e8e8e8',
                    bodyColor: '#a0a0a0',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            if (value >= 1000) {
                                return `${context.dataset.label}: $${(value / 1000).toFixed(2)}T`;
                            }
                            return `${context.dataset.label}: $${value.toFixed(0)}B`;
                        }
                    }
                },
                annotation: {
                    annotations: {
                        currentYear: {
                            type: 'line',
                            xMin: 2024,
                            xMax: 2024,
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                            borderWidth: 2,
                            borderDash: [10, 5],
                            label: {
                                display: true,
                                content: 'Today',
                                position: 'start',
                                backgroundColor: 'rgba(26, 26, 37, 0.9)',
                                color: '#e8e8e8',
                                padding: 6
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#a0a0a0'
                    },
                    title: {
                        display: true,
                        text: 'Year',
                        color: '#a0a0a0'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#a0a0a0',
                        callback: function(value) {
                            if (value >= 1000) {
                                return '$' + (value / 1000).toFixed(1) + 'T';
                            }
                            return '$' + value + 'B';
                        }
                    },
                    title: {
                        display: true,
                        text: 'USD (Billions)',
                        color: '#a0a0a0'
                    }
                }
            }
        },
        plugins: [insolvencyFillPlugin]
    });
    
    updateStats(initialRate, data);
}

// Update chart when slider changes
function updateChart(interestRate) {
    const data = getFullDataset(interestRate);
    
    chart.data.labels = data.years;
    chart.data.datasets[0].data = data.federalRevenue;
    chart.data.datasets[1].data = data.interest;
    chart.data.datasets[2].data = data.defense;
    chart.data.datasets[3].data = data.medicare;
    chart.data.datasets[4].data = data.socialSecurity;
    
    chart.update('none');
    updateStats(interestRate, data);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initChart();
    
    // Setup slider event listener
    const slider = document.getElementById('interestRate');
    const display = document.getElementById('rateDisplay');
    
    slider.addEventListener('input', function() {
        const rate = parseFloat(this.value);
        display.textContent = rate.toFixed(1);
        updateChart(rate);
    });
});
