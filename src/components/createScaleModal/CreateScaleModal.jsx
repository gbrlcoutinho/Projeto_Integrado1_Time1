import { useState, useEffect } from 'react';
import './CreateScaleModal.css';
import { findEligibleEmployees } from '../../ipc-bridge/employee';

function CreateScaleModal({ isOpen, onClose, onSubmit, month, year }) {
    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState('PLANTAO_TARDE');

    const [selectedEmployeesETA, setSelectedEmployeesETA] = useState([]);
    const [selectedEmployeesPlantao, setSelectedEmployeesPlantao] = useState([]);

    const [selectedHolidays, setSelectedHolidays] = useState([]);
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSelectedType('PLANTAO_TARDE');
            setSelectedEmployeesETA([]);
            setSelectedEmployeesPlantao([]);
            setSelectedHolidays([]);
            loadEmployees();
        }
    }, [isOpen]);

    const loadEmployees = async () => {
        try {
            const employees = await findEligibleEmployees();
            if (Array.isArray(employees)) {
                setEmployees(employees);
            } else {
                setEmployees([]);
            }
        } catch (error) {
            console.error('Erro ao carregar funcionários:', error);
            setEmployees([]);
        }
    };

    const toggleEmployee = (employee) => {
        const currentSelectedEmployees = selectedType === 'ETA' ? selectedEmployeesETA : selectedEmployeesPlantao;
        const setCurrentSelectedEmployees = selectedType === 'ETA' ? setSelectedEmployeesETA : setSelectedEmployeesPlantao;

        setCurrentSelectedEmployees(prev => {
            const exists = prev.find(e => e.id === employee.id);

            if (exists) {
                return prev.filter(e => e.id !== employee.id);
            } else {
                return [...prev, employee];
            }
        });
    };

    const toggleHoliday = (dateStr) => {
        setSelectedHolidays(prev => {
            if (prev.includes(dateStr)) {
                return prev.filter(d => d !== dateStr);
            } else {
                return [...prev, dateStr];
            }
        });
    };

    const handleNext = () => {
        if (step === 1) {
            // Verificar se há funcionários selecionados em ambas as escalas
            if (selectedEmployeesETA.length === 0 || selectedEmployeesPlantao.length === 0) {
                alert('Selecione pelo menos um funcionário em cada escala (ETA e Plantão da Tarde).');
                return;
            }
            setStep(2);
        }
    };

    const handlePrevious = () => {
        if (step === 2) {
            setStep(1);
        }
    };

    const handleFinish = () => {
        const payload = {
            month,
            year,
            type: selectedType,
            employeeIds: {
                ETA: selectedEmployeesETA,
                PLANTAO_TARDE: selectedEmployeesPlantao
            },
            holidays: selectedHolidays
        };
        onSubmit(payload);
        onClose();
    };

    const renderCalendar = () => {
        const daysInMonth = new Date(year, month, 0).getDate();
        const firstDay = new Date(year, month - 1, 1).getDay();

        const calendarCells = [];

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            calendarCells.push(<div key={`empty-${i}`} className="modal-day-cell empty"></div>);
        }

        // Actual days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = selectedHolidays.includes(dateStr);

            calendarCells.push(
                <div
                    key={day}
                    className={`modal-day-cell ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleHoliday(dateStr)}
                >
                    {day}
                </div>
            );
        }

        // Fill remaining cells to complete the grid (ensure we have complete weeks)
        const totalCells = calendarCells.length;
        const remainingCells = totalCells % 7;
        if (remainingCells !== 0) {
            const cellsToAdd = 7 - remainingCells;
            for (let i = 0; i < cellsToAdd; i++) {
                calendarCells.push(<div key={`fill-${i}`} className="modal-day-cell empty"></div>);
            }
        }

        // Group cells into rows of 7 (starting on Sunday)
        const rows = [];
        for (let i = 0; i < calendarCells.length; i += 7) {
            rows.push(
                <div key={Math.floor(i / 7)} className="calendar-week-row">
                    {calendarCells.slice(i, i + 7)}
                </div>
            );
        }

        return rows;
    };

    const getMonthName = () => {
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return monthNames[month - 1];
    };

    const filteredEmployees = employees.filter(emp => {
        if (!emp.availabilities) return false;
        const availabilities = emp.availabilities.split(',');
        return availabilities.includes(selectedType);
    });

    if (!isOpen) return null;

    // console.log("employees", employees);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <button className="close-icon" onClick={onClose}>✕</button>

                {step === 1 && (
                    <>
                        <h2 className="modal-title">
                            Funcionários - <span>{getMonthName()} {year}</span>
                        </h2>

                        <div className="tabs-container">
                            <button
                                className={`tab-btn ${selectedType === 'PLANTAO_TARDE' ? 'active' : 'inactive'}`}
                                onClick={() => setSelectedType('PLANTAO_TARDE')}
                            >
                                Plantão da Tarde
                            </button>
                            <button
                                className={`tab-btn ${selectedType === 'ETA' ? 'active' : 'inactive'}`}
                                onClick={() => setSelectedType('ETA')}
                            >
                                Plantão da ETA
                            </button>
                        </div>

                        <div className="list-header">
                            Funcionário
                            {(() => {
                                const currentSelectedEmployees = selectedType === 'ETA' ? selectedEmployeesETA : selectedEmployeesPlantao;
                                return currentSelectedEmployees.length > 0 && (
                                    <span className="selection-count">
                                        {currentSelectedEmployees.length} selecionado{currentSelectedEmployees.length > 1 ? 's' : ''}
                                    </span>
                                );
                            })()}
                        </div>

                        <div className="employee-list">
                            {filteredEmployees.length === 0 && (
                                <div className="empty-state">
                                    Nenhum funcionário disponível para {selectedType === 'ETA' ? 'Plantão da ETA' : 'Plantão da Tarde'}.
                                </div>
                            )}

                            {filteredEmployees.map(employee => (
                                <div key={employee.id} className="employee-row">
                                    <span className="employee-name">{employee.name}</span>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={(() => {
                                                const currentSelectedEmployees = selectedType === 'ETA' ? selectedEmployeesETA : selectedEmployeesPlantao;
                                                return Boolean(currentSelectedEmployees.find(e => e.id === employee.id));
                                            })()}
                                            onChange={() => toggleEmployee(employee)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="modal-footer">
                            <button className="btn-nav btn-prev-step1" disabled>
                                ANTERIOR
                            </button>
                            <button className="btn-nav btn-next-step1" onClick={handleNext}>
                                PRÓXIMO
                            </button>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2 className="modal-title">
                            Feriados - <span>{getMonthName()} {year}</span>
                        </h2>

                        {selectedHolidays.length > 0 && (
                            <div className="holidays-info">
                                {selectedHolidays.length} feriado{selectedHolidays.length > 1 ? 's' : ''} {" "}selecionado{selectedHolidays.length > 1 ? 's' : ''}
                            </div>
                        )}

                        <div className="calendar-container">
                            <div className="week-days">
                                <div>DOM</div>
                                <div>SEG</div>
                                <div>TER</div>
                                <div>QUA</div>
                                <div>QUI</div>
                                <div>SEX</div>
                                <div>SAB</div>
                            </div>
                            <div className="days-grid">
                                {renderCalendar()}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-nav btn-prev-step2" onClick={handlePrevious}>
                                ANTERIOR
                            </button>
                            <button className="btn-nav btn-finish" onClick={handleFinish}>
                                CONCLUIR
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default CreateScaleModal;
