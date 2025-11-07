// src/components/EmployeesTable.jsx

import React, { useState, useEffect, useRef } from 'react';
import { getAllEmployees } from '../employeeService.js'; // Ajuste o caminho se necessário
import './EmployeesTable.css'; // Crie este arquivo para os estilos
import SearchIcon from './SearchIcon';
// --- RESOLUÇÃO DO CONFLITO 1 ---
// Mantivemos os dois imports, o seu e o da main.
import CadastroFuncionarioModal from './cadastroFuncionarioModal/CadastroFuncionarioModal.jsx';
import { use } from 'react';

// DADOS MOCKADOS
const mockFuncionarios = [
  { id: 1, name: 'Gideony', function: 'Operador da ETA', cellphone: '(11) 98765-4321' },
  { id: 2, name: 'José Airton', function: 'Encanador', cellphone: '(21) 91234-5678' },
  { id: 3, name: 'Mariana', function: 'Técnica de Tratamento', cellphone: '(31) 99876-5432' },
  { id: 4, name: 'Carlos', function: 'Supervisor', cellphone: '(41) 91111-2222' },
];

const ITEMS_PER_PAGE = 10;

function EmployeesTable() {
  // --- ESTADOS ---
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Novos estados para a funcionalidade da UI
  const [searchTerm, setSearchTerm] = useState('');

  // --- RESOLUÇÃO DO CONFLITO 2 ---
  // Mantivemos o seu estado do modal E os estados da main
  const [isCadastroModalOpen, setCadastroModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const searchInputRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const firstRowIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const lastRowIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  }

  // --- BUSCA DE DADOS (useEffect) ---
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        if (loading) return; // Se já estiver carregando, não faz nada

        setLoading(true);

        // --- RESOLUÇÃO DO CONFLITO 3 ---
        // Usamos a versão da 'main', que busca dados com paginação e busca (searchTerm).
        // A sua versão (HEAD) que misturava mocks foi descartada
        // porque a 'main' parece ter a lógica de backend correta.
        setError(null);

        const response = await getAllEmployees({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          searchTerm: searchTerm
        });

        setAllEmployees(response.employees);
        setTotalCount(response.totalCount);

      } catch (err) {
        console.error("Erro ao buscar dados dos funcionários:", err);
        setError(err.message || "Erro desconhecido");
        setAllEmployees([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [currentPage, searchTerm]); // A lógica da 'main' estava correta aqui

  // Estes useEffects vieram da 'main' e são necessários para a busca funcionar
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

  // --- FUNÇÃO PARA RENDERIZAR TAGS ---
  // (Esta função não estava no conflito, veio da sua branch)
  const renderTags = (tagsString, className = 'tag') => {
    if (!tagsString || tagsString.trim() === '') {
      return 'N/A'; // Ou null se preferir não mostrar nada
    }
    return tagsString.split(',').map(tag => tag.trim()).map(t => (
      <span key={t} className={className}>{t}</span>
    ));
  };

  // --- RENDERIZAÇÃO DE ESTADOS DE CARREGAMENTO E ERRO ---
  if (loading) {
    return <p>Carregando lista de funcionários...</p>;
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
          {/* Mantivemos seu botão com a sua funcionalidade onClick */}
          <button
            className="btn btn-primary"
            onClick={() => setCadastroModalOpen(true)}>
            CADASTRAR FUNCIONÁRIO
          </button>
        </header>

        {/* --- RESOLUÇÃO DO CONFLITO 4 --- */}
        {/* Usamos a barra de busca da 'main', pois ela usa 'searchText' e 'handleSearchChange' */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              ref={searchInputRef}
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

        {/* --- RESOLUÇÃO DO CONFLITO 5 --- */}
        {/* Usamos a tabela e o rodapé da 'main', pois eles usam 'allEmployees' e a lógica de paginação */}
        <main className="tabela-container">
          <table>
            <thead>
              <tr>
                <th><strong>Nome Completo</strong></th>
                <th><strong>Cargo/Função</strong></th>
                <th><strong>Celular</strong></th>
              </tr>
            </thead>
            <tbody>
              {allEmployees.length > 0 ? (
                allEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td data-label="Nome Completo">{emp.name}</td>
                    <td data-label="Cargo/Função">{emp.function}</td>
                    <td data-label="Celular">{emp.cellphone || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-results">
                    {loading ? "Buscando..." : "Nenhum funcionário encontrado."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </main>

        <footer className="funcionarios-footer">
          <span>Linhas por página: {ITEMS_PER_PAGE} </span>
          {totalCount > 0 && (
            <span>{firstRowIndex}-{lastRowIndex} de {totalCount}</span>
          )}

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

      {/* Mantivemos o seu Modal aqui no final */}
      <CadastroFuncionarioModal
        isOpen={isCadastroModalOpen}
        onClose={() => setCadastroModalOpen(false)}
      />
    </div>
  );
}

export default EmployeesTable;