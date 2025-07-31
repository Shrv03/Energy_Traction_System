// Electric Vehicle Energy Flow Simulator JavaScript

class EVSimulator {
    constructor() {
        this.currentVehicle = 'car';
        this.currentEnergySource = 'battery';
        this.currentTractionSystem = 'ac';
        this.currentSpeed = 60;
        this.currentLoad = 50;
        this.currentAcceleration = 'medium';
        this.comparisonMode = false;
        
        // Vehicle data
        this.vehicles = {
            "car": {
                "name": "Electric Car",
                "powerRange": "50-200 kW",
                "weight": "1200-2000 kg",
                "typicalConsumption": "15-25 kWh/100km",
                "description": "Compact passenger vehicle for urban and highway use"
            },
            "train": {
                "name": "Electric Train",
                "powerRange": "100-500 kW",
                "weight": "40000-80000 kg",
                "typicalConsumption": "3-8 kWh/100km per passenger",
                "description": "Rail transport with overhead power lines or third rail"
            },
            "bus": {
                "name": "Electric Bus",
                "powerRange": "200-500 kW",
                "weight": "10000-18000 kg",
                "typicalConsumption": "80-150 kWh/100km",
                "description": "Public transit vehicle for urban transportation"
            },
            "truck": {
                "name": "Electric Truck",
                "powerRange": "300-800 kW",
                "weight": "15000-40000 kg",
                "typicalConsumption": "100-200 kWh/100km",
                "description": "Heavy-duty vehicle for freight transport"
            }
        };

        this.energySources = {
            "battery": {
                "name": "Battery Storage",
                "efficiency": 0.92,
                "advantages": ["High efficiency", "Zero direct emissions", "Quiet operation"],
                "disadvantages": ["Charging time", "Weight", "Range limitations"]
            },
            "grid": {
                "name": "Grid Electricity",
                "efficiency": 0.93,
                "advantages": ["Unlimited range on electrified routes", "No battery weight", "Instant power"],
                "disadvantages": ["Infrastructure requirements", "Limited to fixed routes"]
            },
            "hydrogen": {
                "name": "Hydrogen Fuel Cell",
                "efficiency": 0.60,
                "advantages": ["Fast refueling", "Long range", "Only water emissions"],
                "disadvantages": ["Lower efficiency", "Infrastructure limited", "Higher cost"]
            }
        };

        this.tractionSystems = {
            "ac": {
                "name": "AC Motor",
                "efficiency": 0.96,
                "advantages": ["Higher efficiency", "Better speed control", "Lower maintenance"],
                "disadvantages": ["More complex control", "Higher initial cost"]
            },
            "dc": {
                "name": "DC Motor",
                "efficiency": 0.87,
                "advantages": ["Simple control", "High starting torque", "Lower cost"],
                "disadvantages": ["Lower efficiency", "Brush maintenance", "Speed limitations"]
            }
        };

        this.componentEfficiencies = {
            powerElectronics: 0.96,
            inverter: 0.94,
            transmission: 0.96
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initChart();
        // Wait for DOM to be fully loaded before setting up SVG interactions
        setTimeout(() => {
            this.setupSVGInteractions();
            this.updateDisplay();
            this.updateDiagram();
        }, 200);
    }

    setupEventListeners() {
        // Vehicle selection
        document.querySelectorAll('.vehicle-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const vehicle = e.currentTarget.dataset.vehicle;
                this.selectVehicle(vehicle);
            });
        });

        // Energy source selection
        document.querySelectorAll('input[name="energySource"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentEnergySource = e.target.value;
                this.updateDisplay();
                this.updateDiagram();
            });
        });

        // Traction system selection
        document.querySelectorAll('input[name="tractionSystem"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentTractionSystem = e.target.value;
                this.updateDisplay();
                this.updateDiagram();
            });
        });

        // Speed slider
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        
        if (speedSlider && speedValue) {
            speedSlider.addEventListener('input', (e) => {
                this.currentSpeed = parseInt(e.target.value);
                speedValue.textContent = this.currentSpeed;
                this.updateDisplay();
            });

            speedSlider.addEventListener('change', (e) => {
                this.currentSpeed = parseInt(e.target.value);
                speedValue.textContent = this.currentSpeed;
                this.updateDisplay();
            });
        }

        // Load slider
        const loadSlider = document.getElementById('loadSlider');
        const loadValue = document.getElementById('loadValue');
        
        if (loadSlider && loadValue) {
            loadSlider.addEventListener('input', (e) => {
                this.currentLoad = parseInt(e.target.value);
                loadValue.textContent = this.currentLoad;
                this.updateDisplay();
            });

            loadSlider.addEventListener('change', (e) => {
                this.currentLoad = parseInt(e.target.value);
                loadValue.textContent = this.currentLoad;
                this.updateDisplay();
            });
        }

        // Acceleration buttons
        document.querySelectorAll('.acceleration-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.acceleration-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentAcceleration = e.target.dataset.acceleration;
                this.updateDisplay();
            });
        });

        // Modal controls
        const modalClose = document.getElementById('modalClose');
        const componentModal = document.getElementById('componentModal');
        
        if (modalClose) {
            modalClose.addEventListener('click', (e) => {
                e.stopPropagation();
                this.hideModal();
            });
        }

        if (componentModal) {
            componentModal.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    this.hideModal();
                }
            });
        }

        // Mode controls
        const toggleComparison = document.getElementById('toggleComparison');
        const resetParams = document.getElementById('resetParams');
        
        if (toggleComparison) {
            toggleComparison.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleComparisonMode();
            });
        }

        if (resetParams) {
            resetParams.addEventListener('click', (e) => {
                e.stopPropagation();
                this.resetParameters();
            });
        }
    }

    setupSVGInteractions() {
        const componentGroups = document.querySelectorAll('.component-group');
        
        componentGroups.forEach(group => {
            // Set cursor style
            group.style.cursor = 'pointer';
            
            // Mouse enter for tooltip
            group.addEventListener('mouseenter', (e) => {
                e.stopPropagation();
                this.showTooltip(e, group.id);
            });
            
            // Mouse leave to hide tooltip
            group.addEventListener('mouseleave', (e) => {
                e.stopPropagation();
                this.hideTooltip();
            });
            
            // Mouse move for tooltip positioning
            group.addEventListener('mousemove', (e) => {
                e.stopPropagation();
                this.updateTooltipPosition(e);
            });
            
            // Click for modal
            group.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showComponentDetails(group.id);
            });
        });

        // Also set up component details display
        const componentDetails = document.getElementById('componentDetails');
        if (componentDetails) {
            componentDetails.innerHTML = `
                <h4>Component Information</h4>
                <p>Hover over diagram components to see details, or click for detailed information.</p>
            `;
        }
    }

    selectVehicle(vehicle) {
        // Update active vehicle
        document.querySelectorAll('.vehicle-option').forEach(option => {
            option.classList.remove('active');
        });
        const selectedOption = document.querySelector(`[data-vehicle="${vehicle}"]`);
        if (selectedOption) {
            selectedOption.classList.add('active');
        }
        
        this.currentVehicle = vehicle;
        this.updateDisplay();
        this.updateDiagram();
    }

    calculateEfficiencies() {
        const sourceEfficiency = this.energySources[this.currentEnergySource].efficiency;
        const motorEfficiency = this.tractionSystems[this.currentTractionSystem].efficiency;
        
        // Adjust efficiencies based on operating conditions
        const speedFactor = this.getSpeedEfficiencyFactor();
        const loadFactor = this.getLoadEfficiencyFactor();
        const accelerationFactor = this.getAccelerationEfficiencyFactor();
        
        const adjustedMotorEfficiency = motorEfficiency * speedFactor * loadFactor * accelerationFactor;
        const adjustedInverterEfficiency = this.componentEfficiencies.inverter * loadFactor;
        
        return {
            source: sourceEfficiency,
            powerElectronics: this.componentEfficiencies.powerElectronics,
            inverter: adjustedInverterEfficiency,
            motor: adjustedMotorEfficiency,
            transmission: this.componentEfficiencies.transmission,
            overall: sourceEfficiency * this.componentEfficiencies.powerElectronics * 
                    adjustedInverterEfficiency * adjustedMotorEfficiency * 
                    this.componentEfficiencies.transmission
        };
    }

    getSpeedEfficiencyFactor() {
        // Efficiency decreases at very high speeds due to aerodynamic losses
        if (this.currentSpeed < 50) return 1.0;
        if (this.currentSpeed < 80) return 0.98;
        if (this.currentSpeed < 100) return 0.95;
        return 0.90;
    }

    getLoadEfficiencyFactor() {
        // Motors are most efficient at moderate loads
        if (this.currentLoad < 20) return 0.85;
        if (this.currentLoad < 60) return 1.0;
        if (this.currentLoad < 80) return 0.95;
        return 0.90;
    }

    getAccelerationEfficiencyFactor() {
        switch (this.currentAcceleration) {
            case 'low': return 1.0;
            case 'medium': return 0.95;
            case 'high': return 0.85;
            default: return 0.95;
        }
    }

    calculateEnergyConsumption() {
        const efficiencies = this.calculateEfficiencies();
        const baseConsumption = this.getBaseConsumption();
        
        // Adjust for current conditions
        const speedMultiplier = Math.pow(this.currentSpeed / 60, 1.5);
        const loadMultiplier = 1 + (this.currentLoad / 100) * 0.5;
        const accelerationMultiplier = this.currentAcceleration === 'high' ? 1.3 : 
                                     this.currentAcceleration === 'low' ? 0.8 : 1.0;
        
        const consumption = baseConsumption * speedMultiplier * loadMultiplier * 
                          accelerationMultiplier / efficiencies.overall;
        
        return Math.round(consumption * 10) / 10;
    }

    getBaseConsumption() {
        const consumptionRanges = {
            car: 20,
            train: 5,
            bus: 115,
            truck: 150
        };
        return consumptionRanges[this.currentVehicle];
    }

    calculateRange() {
        const consumption = this.calculateEnergyConsumption();
        const batteryCapacities = {
            car: 75,
            train: 1000,
            bus: 300,
            truck: 500
        };
        
        if (this.currentEnergySource === 'grid') {
            return 'Unlimited*';
        }
        
        const capacity = batteryCapacities[this.currentVehicle];
        const range = Math.round(capacity / consumption * 100);
        return range + ' km';
    }

    updateDisplay() {
        const efficiencies = this.calculateEfficiencies();
        const consumption = this.calculateEnergyConsumption();
        const range = this.calculateRange();

        // Update overall efficiency
        const overallEfficiencyElement = document.getElementById('overallEfficiency');
        if (overallEfficiencyElement) {
            overallEfficiencyElement.textContent = Math.round(efficiencies.overall * 100) + '%';
        }

        // Update performance metrics
        const energyConsumptionElement = document.getElementById('energyConsumption');
        const estimatedRangeElement = document.getElementById('estimatedRange');
        
        if (energyConsumptionElement) {
            energyConsumptionElement.textContent = consumption + ' kWh/100km';
        }
        if (estimatedRangeElement) {
            estimatedRangeElement.textContent = range;
        }

        // Update educational info
        this.updateEducationalInfo();

        // Update chart
        if (this.chart) {
            this.updateChart(efficiencies);
        }

        // Update diagram efficiency labels
        this.updateEfficiencyLabels(efficiencies);
        this.updateLossIndicators(efficiencies);
    }

    updateEducationalInfo() {
        const sourceData = this.energySources[this.currentEnergySource];
        const tractionData = this.tractionSystems[this.currentTractionSystem];

        const currentEnergySourceElement = document.getElementById('currentEnergySource');
        const currentTractionSystemElement = document.getElementById('currentTractionSystem');
        
        if (currentEnergySourceElement) {
            currentEnergySourceElement.textContent = sourceData.name;
        }
        if (currentTractionSystemElement) {
            currentTractionSystemElement.textContent = tractionData.name;
        }

        const advantagesList = document.getElementById('configAdvantages');
        if (advantagesList) {
            advantagesList.innerHTML = '';
            
            const combinedAdvantages = [...sourceData.advantages, ...tractionData.advantages];
            combinedAdvantages.slice(0, 4).forEach(advantage => {
                const li = document.createElement('li');
                li.textContent = advantage;
                advantagesList.appendChild(li);
            });
        }
    }

    updateDiagram() {
        // Update source component
        this.updateSourceComponent();
        
        // Update motor component
        this.updateMotorComponent();
        
        // Animate energy flow
        this.animateEnergyFlow();
    }

    updateSourceComponent() {
        const sourceElement = document.querySelector('#energySource rect');
        const sourceLabel = document.querySelectorAll('#energySource .component-label')[0];
        
        if (sourceElement) {
            sourceElement.className.baseVal = `component ${this.currentEnergySource}-source`;
        }
        if (sourceLabel) {
            const sourceName = this.energySources[this.currentEnergySource].name;
            sourceLabel.textContent = sourceName.length > 8 ? sourceName.substring(0, 8) : sourceName;
        }
    }

    updateMotorComponent() {
        const motorElement = document.querySelector('#motor rect');
        const motorLabel = document.querySelectorAll('#motor .component-label')[0];
        
        if (motorElement) {
            motorElement.className.baseVal = `component ${this.currentTractionSystem}-motor`;
        }
        if (motorLabel) {
            motorLabel.textContent = this.tractionSystems[this.currentTractionSystem].name;
        }
    }

    updateEfficiencyLabels(efficiencies) {
        const labels = [
            { selector: '#energySource .efficiency-label', value: efficiencies.source },
            { selector: '#powerElectronics .efficiency-label', value: efficiencies.powerElectronics },
            { selector: '#inverterController .efficiency-label', value: efficiencies.inverter },
            { selector: '#motor .efficiency-label', value: efficiencies.motor },
            { selector: '#transmission .efficiency-label', value: efficiencies.transmission }
        ];

        labels.forEach(label => {
            const element = document.querySelector(label.selector);
            if (element) {
                element.textContent = Math.round(label.value * 100) + '%';
            }
        });
    }

    updateLossIndicators(efficiencies) {
        const losses = [
            { selector: '#lossIndicators text:nth-child(1)', value: 1 - efficiencies.powerElectronics },
            { selector: '#lossIndicators text:nth-child(2)', value: 1 - efficiencies.inverter },
            { selector: '#lossIndicators text:nth-child(3)', value: 1 - efficiencies.motor },
            { selector: '#lossIndicators text:nth-child(4)', value: 1 - efficiencies.transmission }
        ];

        losses.forEach(loss => {
            const element = document.querySelector(loss.selector);
            if (element) {
                element.textContent = Math.round(loss.value * 100) + '% loss';
            }
        });
    }

    animateEnergyFlow() {
        document.querySelectorAll('.flow-arrow').forEach(arrow => {
            arrow.classList.add('animated');
        });
    }

    showTooltip(event, componentId) {
        const tooltip = document.getElementById('tooltip');
        if (!tooltip) return;
        
        const content = this.getTooltipContent(componentId);
        const tooltipContent = tooltip.querySelector('.tooltip-content');
        
        if (tooltipContent) {
            tooltipContent.innerHTML = content;
        }
        
        tooltip.classList.remove('hidden');
        this.updateTooltipPosition(event);
    }

    updateTooltipPosition(event) {
        const tooltip = document.getElementById('tooltip');
        if (!tooltip || tooltip.classList.contains('hidden')) return;
        
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        tooltip.style.position = 'absolute';
        tooltip.style.left = (event.clientX + scrollLeft) + 'px';
        tooltip.style.top = (event.clientY + scrollTop - tooltip.offsetHeight - 10) + 'px';
        tooltip.style.transform = 'translateX(-50%)';
    }

    hideTooltip() {
        const tooltip = document.getElementById('tooltip');
        if (tooltip) {
            tooltip.classList.add('hidden');
        }
    }

    getTooltipContent(componentId) {
        const efficiencies = this.calculateEfficiencies();
        
        const tooltips = {
            energySource: `<strong>${this.energySources[this.currentEnergySource].name}</strong><br>
                          Primary energy source for the vehicle<br>
                          Efficiency: ${Math.round(efficiencies.source * 100)}%`,
            powerElectronics: `<strong>Power Electronics</strong><br>
                              Converts and conditions electrical power<br>
                              Efficiency: ${Math.round(efficiencies.powerElectronics * 100)}%`,
            inverterController: `<strong>Inverter/Controller</strong><br>
                                Converts DC to AC and controls motor speed<br>
                                Efficiency: ${Math.round(efficiencies.inverter * 100)}%`,
            motor: `<strong>${this.tractionSystems[this.currentTractionSystem].name}</strong><br>
                   Converts electrical energy to mechanical rotation<br>
                   Efficiency: ${Math.round(efficiencies.motor * 100)}%`,
            transmission: `<strong>Transmission/Gearbox</strong><br>
                          Adjusts torque and speed for optimal wheel drive<br>
                          Efficiency: ${Math.round(efficiencies.transmission * 100)}%`,
            wheels: `<strong>Wheels</strong><br>
                    Final mechanical output to move the vehicle<br>
                    Speed: ${this.currentSpeed} km/h<br>
                    Load: ${this.currentLoad}%`
        };
        
        return tooltips[componentId] || 'Component information';
    }

    showComponentDetails(componentId) {
        const modal = document.getElementById('componentModal');
        const title = document.getElementById('modalTitle');
        const body = document.getElementById('modalBody');
        
        if (!modal || !title || !body) return;
        
        const details = this.getComponentDetails(componentId);
        title.textContent = details.title;
        body.innerHTML = details.content;
        
        modal.classList.remove('hidden');

        // Update component details in sidebar
        const componentDetails = document.getElementById('componentDetails');
        if (componentDetails) {
            componentDetails.innerHTML = `
                <h4>${details.title}</h4>
                <p><strong>Current Efficiency:</strong> ${details.efficiency}%</p>
                <p>${details.description}</p>
            `;
        }
    }

    hideModal() {
        const modal = document.getElementById('componentModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    getComponentDetails(componentId) {
        const efficiencies = this.calculateEfficiencies();
        
        const details = {
            energySource: {
                title: this.energySources[this.currentEnergySource].name,
                efficiency: Math.round(efficiencies.source * 100),
                description: 'Primary energy source for the vehicle',
                content: `
                    <p><strong>Function:</strong> Primary energy source for the vehicle</p>
                    <p><strong>Current Efficiency:</strong> ${Math.round(efficiencies.source * 100)}%</p>
                    <p><strong>Advantages:</strong></p>
                    <ul>${this.energySources[this.currentEnergySource].advantages.map(a => `<li>${a}</li>`).join('')}</ul>
                    <p><strong>Disadvantages:</strong></p>
                    <ul>${this.energySources[this.currentEnergySource].disadvantages.map(d => `<li>${d}</li>`).join('')}</ul>
                `
            },
            powerElectronics: {
                title: 'Power Electronics',
                efficiency: Math.round(efficiencies.powerElectronics * 100),
                description: 'Converts and conditions electrical power from the source',
                content: `
                    <p><strong>Function:</strong> Converts and conditions electrical power from the source</p>
                    <p><strong>Current Efficiency:</strong> ${Math.round(efficiencies.powerElectronics * 100)}%</p>
                    <p><strong>Energy Loss:</strong> ${Math.round((1 - efficiencies.powerElectronics) * 100)}%</p>
                    <p>Power electronics manage voltage levels, filter noise, and protect downstream components.</p>
                `
            },
            inverterController: {
                title: 'Inverter/Controller',
                efficiency: Math.round(efficiencies.inverter * 100),
                description: 'Converts DC to AC and controls motor speed/torque',
                content: `
                    <p><strong>Function:</strong> Converts DC to AC and controls motor speed/torque</p>
                    <p><strong>Current Efficiency:</strong> ${Math.round(efficiencies.inverter * 100)}%</p>
                    <p><strong>Energy Loss:</strong> ${Math.round((1 - efficiencies.inverter) * 100)}%</p>
                    <p>The inverter uses switching electronics to create variable-frequency AC power for precise motor control.</p>
                `
            },
            motor: {
                title: this.tractionSystems[this.currentTractionSystem].name,
                efficiency: Math.round(efficiencies.motor * 100),
                description: 'Converts electrical energy to mechanical rotation',
                content: `
                    <p><strong>Function:</strong> Converts electrical energy to mechanical rotation</p>
                    <p><strong>Current Efficiency:</strong> ${Math.round(efficiencies.motor * 100)}%</p>
                    <p><strong>Energy Loss:</strong> ${Math.round((1 - efficiencies.motor) * 100)}%</p>
                    <p><strong>Operating Conditions:</strong> Speed: ${this.currentSpeed} km/h, Load: ${this.currentLoad}%</p>
                    <p><strong>Advantages:</strong></p>
                    <ul>${this.tractionSystems[this.currentTractionSystem].advantages.map(a => `<li>${a}</li>`).join('')}</ul>
                    <p><strong>Disadvantages:</strong></p>
                    <ul>${this.tractionSystems[this.currentTractionSystem].disadvantages.map(d => `<li>${d}</li>`).join('')}</ul>
                `
            },
            transmission: {
                title: 'Transmission/Gearbox',
                efficiency: Math.round(efficiencies.transmission * 100),
                description: 'Adjusts torque and speed for optimal wheel drive',
                content: `
                    <p><strong>Function:</strong> Adjusts torque and speed for optimal wheel drive</p>
                    <p><strong>Current Efficiency:</strong> ${Math.round(efficiencies.transmission * 100)}%</p>
                    <p><strong>Energy Loss:</strong> ${Math.round((1 - efficiencies.transmission) * 100)}%</p>
                    <p>The transmission optimizes the motor's power delivery across different driving conditions.</p>
                `
            },
            wheels: {
                title: 'Wheels',
                efficiency: 100,
                description: 'Final mechanical output to move the vehicle',
                content: `
                    <p><strong>Function:</strong> Final mechanical output to move the vehicle</p>
                    <p><strong>Current Speed:</strong> ${this.currentSpeed} km/h</p>
                    <p><strong>Load:</strong> ${this.currentLoad}%</p>
                    <p><strong>Acceleration:</strong> ${this.currentAcceleration}</p>
                    <p>The wheels convert rotational motion to linear vehicle movement, with efficiency affected by rolling resistance and aerodynamics.</p>
                `
            }
        };
        
        return details[componentId] || { 
            title: 'Component', 
            efficiency: 0,
            description: 'No details available',
            content: 'No details available' 
        };
    }

    initChart() {
        const ctx = document.getElementById('lossBreakdownChart');
        if (!ctx) return;
        
        this.chart = new Chart(ctx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: ['Power Electronics', 'Inverter', 'Motor', 'Transmission', 'Useful Output'],
                datasets: [{
                    data: [4, 6, 4, 4, 82],
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                size: 10
                            }
                        }
                    }
                }
            }
        });
    }

    updateChart(efficiencies) {
        if (!this.chart) return;
        
        const losses = [
            (1 - efficiencies.powerElectronics) * 100,
            (1 - efficiencies.inverter) * 100,
            (1 - efficiencies.motor) * 100,
            (1 - efficiencies.transmission) * 100
        ];
        
        const totalLoss = losses.reduce((sum, loss) => sum + loss, 0);
        const usefulOutput = 100 - totalLoss;
        
        this.chart.data.datasets[0].data = [...losses, usefulOutput];
        this.chart.update();
    }

    toggleComparisonMode() {
        this.comparisonMode = !this.comparisonMode;
        const comparisonDiagram = document.getElementById('comparisonDiagram');
        const toggleButton = document.getElementById('toggleComparison');
        
        if (!comparisonDiagram || !toggleButton) return;
        
        if (this.comparisonMode) {
            comparisonDiagram.classList.remove('hidden');
            toggleButton.textContent = 'Exit Compare';
            toggleButton.classList.add('btn--primary');
            toggleButton.classList.remove('btn--secondary');
        } else {
            comparisonDiagram.classList.add('hidden');
            toggleButton.textContent = 'Compare Mode';
            toggleButton.classList.add('btn--secondary');
            toggleButton.classList.remove('btn--primary');
        }
    }

    resetParameters() {
        this.currentSpeed = 60;
        this.currentLoad = 50;
        this.currentAcceleration = 'medium';
        
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        const loadSlider = document.getElementById('loadSlider');
        const loadValue = document.getElementById('loadValue');
        
        if (speedSlider) speedSlider.value = 60;
        if (speedValue) speedValue.textContent = '60';
        if (loadSlider) loadSlider.value = 50;
        if (loadValue) loadValue.textContent = '50';
        
        document.querySelectorAll('.acceleration-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const mediumBtn = document.querySelector('[data-acceleration="medium"]');
        if (mediumBtn) {
            mediumBtn.classList.add('active');
        }
        
        this.updateDisplay();
        this.updateDiagram();
    }
}

// Initialize the simulator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EVSimulator();
});