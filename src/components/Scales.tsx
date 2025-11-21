import React, { useState, useEffect } from 'react';
import './Scales.css';
import { getScale } from '../ipc-bridge/scale';
import CreateScaleModal from './createScaleModal/CreateScaleModal';

const Scales: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts, setShifts] = useState<any[]>([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Busca os dados sempre que o Mês mudar
  useEffect(() => {
    const fetchScale = async () => {
      try {
        // Formata a data para o formato que o Back-end espera
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // +1 porque Jan é 0
        const monthString = `${year}-${month}`;

        // Busca ambas as escalas (ETA e PLANTAO_TARDE)
        const [etaResult, plantaoResult] = await Promise.all([
          getScale({ month: monthString, type: 'ETA' }),
          getScale({ month: monthString, type: 'PLANTAO_TARDE' })
        ]);

        const allShifts = [];

        // Adiciona turnos da ETA com identificação
        if (etaResult && etaResult.shifts) {
          const etaShifts = etaResult.shifts.map((shift: any) => ({
            ...shift,
            scaleType: 'ETA'
          }));
          allShifts.push(...etaShifts);
        }

        // Adiciona turnos do PLANTAO_TARDE com identificação  
        if (plantaoResult && plantaoResult.shifts) {
          const plantaoShifts = plantaoResult.shifts.map((shift: any) => ({
            ...shift,
            scaleType: 'PLANTAO_TARDE'
          }));
          allShifts.push(...plantaoShifts);
        }

        setShifts(allShifts);
      } catch (error) {
        console.error("Erro ao buscar escala:", error);
        setShifts([]);
      }
    };

    fetchScale();
  }, [currentDate]); // Roda se mudar a data

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1);
    setCurrentDate(newDate);
  };

  const handleCreateScale = async (result: any) => {
    try {
      if (result.success && result.data) {
        const allShifts = [];

        // Adiciona turnos da ETA com identificação
        if (result.data.ETA && result.data.ETA.shifts) {
          const etaShifts = result.data.ETA.shifts.map((shift: any) => ({
            ...shift,
            scaleType: 'ETA'
          }));
          allShifts.push(...etaShifts);
        }

        // Adiciona turnos do PLANTAO_TARDE com identificação
        if (result.data.PLANTAO_TARDE && result.data.PLANTAO_TARDE.shifts) {
          const plantaoShifts = result.data.PLANTAO_TARDE.shifts.map((shift: any) => ({
            ...shift,
            scaleType: 'PLANTAO_TARDE'
          }));
          allShifts.push(...plantaoShifts);
        }

        setShifts(allShifts);
        console.log(`Displaying ${allShifts.length} total shifts from both scales`);
      }

    } catch (error) {
      console.error('Erro ao criar escala:', error);
      alert('Erro ao criar escala. Tente novamente.');
    }
  };

  // Gera os dias do calendário
  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startDayIndex = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarCells: { dateStr: string; day: number; isCurrentMonth: boolean }[] = [];

    // Helper para formatar data YYYY-MM-DD localmente (evita problemas de fuso horário do toISOString)
    const formatDateStr = (y: number, m: number, d: number) => {
      const mm = String(m + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      return `${y}-${mm}-${dd}`;
    };

    // Dias do mês anterior
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startDayIndex; i > 0; i--) {
      const dayNum = prevMonthDays - i + 1;
      const dObj = new Date(year, month - 1, dayNum);
      calendarCells.push({
        dateStr: formatDateStr(dObj.getFullYear(), dObj.getMonth(), dObj.getDate()),
        day: dayNum,
        isCurrentMonth: false
      });
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      calendarCells.push({
        dateStr: formatDateStr(year, month, day),
        day,
        isCurrentMonth: true
      });
    }

    // Preencher linhas restantes
    const totalNeeded = startDayIndex + daysInMonth;
    const target = totalNeeded > 35 ? 42 : 35;

    if (calendarCells.length < target) {
      const toAdd = target - calendarCells.length;
      for (let i = 1; i <= toAdd; i++) {
        const dObj = new Date(year, month + 1, i);
        calendarCells.push({
          dateStr: formatDateStr(dObj.getFullYear(), dObj.getMonth(), dObj.getDate()),
          day: i,
          isCurrentMonth: false
        });
      }
    }

    // Converte as células em JSX elements
    const cellElements = calendarCells.map((cell, index) => {
      const todayStr = formatDateStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
      const isToday = cell.dateStr === todayStr;

      // Filtra os turnos para este dia específico
      const dailyShifts = shifts.filter(s => s.date === cell.dateStr);

      return (
        <div
          key={index}
          className={`day-cell ${!cell.isCurrentMonth ? 'inactive' : ''} ${isToday ? 'today' : ''}`}
        >
          <div className="day-number">{cell.day}</div>
          <div className="day-events">
            {dailyShifts.map((shift, i) => {
              // Determine background color based on scale type
              const backgroundColor = shift.scaleType === 'ETA' ? '#FFE599' : '#6FA8DC';
              const textColor = shift.scaleType === 'ETA' ? '#000' : '#fff';

              return (
                <div
                  key={i}
                  className="event-block"
                  style={{
                    backgroundColor: backgroundColor,
                    color: textColor
                  }}
                  title={`${shift.employee_name} - ${shift.scaleType}`}
                >
                  {/* Mostra apenas o primeiro nome ou nome completo conforme espaço */}
                  {shift.employee_name}
                </div>
              );
            })}
          </div>
        </div>
      );
    });

    // Agrupa as células em linhas de 7 (começando no domingo)
    const rows = [];
    for (let i = 0; i < cellElements.length; i += 7) {
      rows.push(
        <div key={Math.floor(i / 7)} className="calendar-week-row">
          {cellElements.slice(i, i + 7)}
        </div>
      );
    }

    return rows;
  };

  const monthStr = currentDate.toLocaleDateString('pt-BR', { month: 'long' });
  const yearStr = currentDate.getFullYear();
  const monthCap = monthStr.charAt(0).toUpperCase() + monthStr.slice(1);

  return (
    <div className="scales-page-container">
      <div className="calendar-header-actions">
        <div className="calendar-nav">
          <button onClick={() => changeMonth(-1)} className="nav-button">❮</button>
          <h3 className="month-title">
            <span className="prefix-text">Escala Mensal -</span>
            <span className="month-text">{monthCap}</span>
            <span className="year-text">{yearStr}</span>
          </h3>
          <button onClick={() => changeMonth(1)} className="nav-button">❯</button>
        </div>
        <div className="action-buttons">
          <button className="btn-action primary" onClick={() => setIsCreateModalOpen(true)}>
            CRIAR ESCALA
          </button>
          {/* <button className="btn-action primary">BAIXAR</button> */}
          {/* <button className="btn-action secondary">PUBLICAR</button> */}
          {/* <button className="btn-action edit">EDITAR</button> */}
        </div>
      </div>
      <div className="calendar-grid-container">
        <div className="weekdays-header">
          {weekDays.map(day => (<div key={day} className="weekday">{day}</div>))}
        </div>
        <div className="days-grid">
          {renderCalendarDays()}
        </div>
      </div>

      <CreateScaleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateScale}
        month={currentDate.getMonth() + 1}
        year={currentDate.getFullYear()}
      />
    </div>
  );
};

export default Scales;