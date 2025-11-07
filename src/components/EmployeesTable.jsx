import { useState, useEffect, useRef } from 'react';
import { getAllEmployees, deleteEmployee } from '../ipc-bridge/employee.js';
import SearchIcon from './SearchIcon';
import FuncionarioModal from './FuncionarioModal/FuncionarioModal.jsx';
import './EmployeesTable.css';

const ITEMS_PER_PAGE = 10;

function EmployeesTable() {
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para a funcionalidade da pesquisa
  const [searchTerm, setSearchTerm] = useState('');

  // --- INÍCIO DAS MUDANÇAS: Estados do Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  // --- FIM DAS MUDANÇAS ---

  const [searchText, setSearchText] = useState('');
  const searchInputRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const firstRowIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const lastRowIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);

  // Estado para a funcionalidade de atualização
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  }
  const [isCadastroModalOpen, setCadastroModalOpen] = useState(false);

  // --- BUSCA DE DADOS (useEffect) ---
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        if (loading) return;
        setLoading(true);
        setError(null);

        const response = await getAllEmployees({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          searchTerm: searchTerm
        });

        setAllEmployees(response.employees);
        setTotalCount(response.totalCount);

      } catch (err) {
        console.error("Erro ao simular dados dos funcionários:", err);
        setError(err.message || "Erro desconhecido");
        setAllEmployees([]);
        setTotalCount(0);
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [currentPage, searchTerm, refreshKey]);

  const handleDelete = async (id) => {
    try {
      await deleteEmployee(id);

      setRefreshKey((prevKey) => prevKey + 1);
      if (allEmployees.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      setError(error.message || "Erro desconhecido");
    }
  };

  useEffect(() => {
    if (searchText === searchTerm) return;
    const delaySearch = setTimeout(() => {
      setSearchTerm(searchText);
    }, 300);
    return () => clearTimeout(delaySearch);
  }, [searchText, searchTerm]);

  useEffect(() => {
    if (searchTerm && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, currentPage]);

  useEffect(() => {
    if (!loading && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [loading]);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // --- INÍCIO DAS MUDANÇAS: Funções do Modal ---
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const openViewModal = (employee) => {
    setModalMode('view');
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  // Não precisamos do openEditModal aqui, pois ele é chamado de dentro do 'view'

  const closeModal = () => {
    setIsModalOpen(false);
  };
  // --- FIM DAS MUDANÇAS ---

  // (A função renderTags foi removida pois não estava sendo usada)

  // --- RENDERIZAÇÃO DE ESTADOS DE CARREGAMENTO E ERRO ---
  if (loading) {
    // (Vamos mostrar a tabela mesmo durante o loading, fica mais suave)
  }

  if (error) {
    return <p style={{ color: 'red' }}> Ocorreu um erro: {error}</p>;
  }

  // --- RENDERIZAÇÃO PRINCIPAL (JSX ESTRUTURADO COMO O FIGMA) ---
  return (
    <div className="employees-page">
      <div className="funcionarios-container">

        <header className="page-header">
          <h1>Funcionários</h1>
          <button
            className="btn btn-primary"
            onClick={openCreateModal} // <-- MUDANÇA AQUI
          >
            CADASTRAR FUNCIONÁRIO
          </button>
        </header>

        {/* --- RESOLUÇÃO DO CONFLITO 4 --- */}
        {/* Usamos a barra de busca da 'main', pois ela usa 'searchText' e 'handleSearchChange' */}
        <div className="search-container">
          {/* 1. A label estática "Pesquisar" (que estava faltando) */}
          <label htmlFor="searchInput" className="search-label">Pesquisar</label>
          <div className="search-input-wrapper">
            <input
              type="text"
              ref={searchInputRef}
              id="searchInput"
              placeholder="Nome, cargo/função"
              className="search-input"
              value={searchText}
              onChange={handleSearchChange}
            />
            <div className="search-icon">
              <SearchIcon />
            </div>
          </div>
        </div>

        <main className="tabela-container">
          <table>
            <thead>
              <tr>
                <th><strong>Nome Completo</strong></th>
                <th><strong>Cargo/Função</strong></th>
                <th><strong>Celular</strong></th>
                {/* Coluna "Ações" removida para bater com o Figma */}
              </tr>
            </thead>
            <tbody>
              {allEmployees.length > 0 ? (
                allEmployees.map((emp) => (
                  // --- INÍCIO DAS MUDANÇAS: Linha clicável ---
                  <tr key={emp.id} className="clickable-row" onClick={() => openViewModal(emp)}>
                    <td data-label="Nome Completo">{emp.name}</td>
                    <td data-label="Cargo/Função">{emp.function}</td>
                    <td data-label="Celular">{emp.cellphone || '—'}</td>
                    {/* Coluna "Ações" removida */}
                  </tr>
                  // --- FIM DAS MUDANÇAS ---
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-results"> {/* Colspan 3, não 4 */}
                    {loading ? "Buscando..." : "Nenhum funcionário encontrado."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </main>

        <footer className="funcionarios-footer">
          {/* Lógica de paginação virá aqui */}
          <span>Linhas por página: {ITEMS_PER_PAGE} </span>
          {totalCount > 0 && (
            <span>{firstRowIndex}-{lastRowIndex} de {totalCount}</span>
          )}

          {/* Adicionar ícones de navegação aqui */}
          <div className="pagination-controls">
            <button
              className='btn btn-primary'
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              &lt; Anterior
            </button>
            <button
              className='btn btn-primary'
              onClick={goToNextPage}
              disabled={currentPage >= totalPages || totalPages === 0 || loading}
            >
              Próximo &gt;
            </button>
          </div>
        </footer>
      </div>

      <FuncionarioModal
        isOpen={isModalOpen}
        onClose={closeModal}
        initialMode={modalMode}
        employee={selectedEmployee}
      />
    </div>
  );
}

export default EmployeesTable;