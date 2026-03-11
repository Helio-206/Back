import { Link } from 'react-router-dom';
import styles from './PrivacyPolicyPage.module.css';

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLogo}>
            <img src="/assets/emblema-angola.png" alt="Emblema de Angola" />
          </div>
          <div>
            <p className={styles.headerSup}>Itel —  Instituto de Telecomunicações</p>
            <h1 className={styles.headerTitle}>Política de Privacidade</h1>
            <p className={styles.headerSub}>
              Plataforma de Gestão e Agendamento de Bilhetes de Identidade
            </p>
          </div>
        </div>
        <div className={styles.headerMeta}>
          <span>Versão 1.0</span>
          <span className={styles.dot}>·</span>
          <span>Vigente desde 3 de Março de 2026</span>
          <span className={styles.dot}>·</span>
          <span>Última revisão: 8 de Março de 2026</span>
        </div>
      </header>

      <div className={styles.container}>
        {/* Índice */}
        <nav className={styles.toc}>
          <p className={styles.tocTitle}>Índice</p>
          <ol className={styles.tocList}>
            <li><a href="#responsavel">1. Responsável pelo Tratamento</a></li>
            <li><a href="#dados">2. Dados Pessoais Recolhidos</a></li>
            <li><a href="#finalidades">3. Finalidades e Base Legal</a></li>
            <li><a href="#destinatarios">4. Destinatários dos Dados</a></li>
            <li><a href="#conservacao">5. Prazo de Conservação</a></li>
            <li><a href="#direitos">6. Direitos do Titular</a></li>
            <li><a href="#seguranca">7. Segurança e Confidencialidade</a></li>
            <li><a href="#cookies">8. Ficheiros de Sessão (Cookies)</a></li>
            <li><a href="#menores">9. Proteção de Menores</a></li>
            <li><a href="#alteracoes">10. Alterações a Esta Política</a></li>
            <li><a href="#contacto">11. Contacto e Reclamações</a></li>
          </ol>
        </nav>

        <main className={styles.content}>

          {/* Preâmbulo */}
          <section className={styles.preamble}>
            <p>
              O <strong>BPI (Bureau Político do ITEL)</strong>, através da sua plataforma
              comprometida com a proteção dos dados pessoais dos
              cidadãos angolanos, elabora a presente Política de Privacidade em conformidade com a
              <strong> Lei n.º 22/11 de 17 de Junho</strong> (Lei de Protecção de Dados Pessoais de Angola),
              a <strong>Lei n.º 7/17 de 16 de Fevereiro</strong> (Lei das Comunicações Electrónicas e dos
              Serviços da Sociedade de Informação) e demais legislação aplicável da República de Angola.
            </p>
            <p>
              Ao utilizar esta plataforma, o cidadão reconhece que leu, compreendeu e aceita os termos
              aqui descritos. Caso não concorde com qualquer disposição, deverá abster-se de utilizar
              a plataforma e contactar os serviços competentes presencialmente.
            </p>
          </section>

          {/* 1 */}
          <section id="responsavel" className={styles.section}>
            <h2><span className={styles.num}>1.</span> Responsável pelo Tratamento de Dados</h2>
            <div className={styles.infoCard}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Entidade</span>
                <span>Instituto de Telecomunicações (ITEL)</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Tutela</span>
                <span>Ministério das Telecomunicações, Tecnologias de Informação e Comunicação Social — MINTTICS</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Sede</span>
                <span>Rua Amílcar Cabral, n.º 42, Maianga, Luanda — República de Angola</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>NIF</span>
                <span>A definir</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>E-mail DPO</span>
                <span>HELIOMATONDO@GMAIL.COM</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Telefone</span>
                <span>+244 931 026 262</span>
              </div>
            </div>
          </section>

          {/* 2 */}
          <section id="dados" className={styles.section}>
            <h2><span className={styles.num}>2.</span> Dados Pessoais Recolhidos</h2>
            <p>
              No âmbito do serviço de registo, autenticação e agendamento para emissão ou renovação
              de Bilhete de Identidade, recolhemos as seguintes categorias de dados:
            </p>

            <h3>2.1 Dados de Identificação</h3>
            <ul>
              <li>Nome completo conforme inscrito no registo civil</li>
              <li>Número do Bilhete de Identidade (BI)</li>
              <li>Data de nascimento</li>
              <li>Género</li>
              <li>Naturalidade e Nacionalidade</li>
              <li>Filiação (nome do pai e da mãe)</li>
            </ul>

            <h3>2.2 Dados de Contacto</h3>
            <ul>
              <li>Endereço de correio eletrónico</li>
              <li>Número de telefone/telemóvel</li>
              <li>Endereço de residência (provincia, município, bairro)</li>
            </ul>

            <h3>2.3 Dados de Utilização da Plataforma</h3>
            <ul>
              <li>Endereço IP e identificador de sessão</li>
              <li>Data, hora e tipo de operação realizada</li>
              <li>Historial de agendamentos e estados de processo</li>
              <li>Documentos digitalizados submetidos (BI, certidões)</li>
              <li>Registos de acesso e autenticação (logs)</li>
            </ul>

            <h3>2.4 Dados de Categorias Especiais</h3>
            <p>
              Esta plataforma <strong>não recolhe</strong> dados de categoria especial
              (saúde, orientação sexual, crenças religiosas, filiação política) de forma directa.
              Caso algum documento submetido contenha inadvertidamente tais dados, os mesmos são
              tratados com medidas de segurança reforçadas e utilizados exclusivamente para o fim
              da identificação civil.
            </p>
          </section>

          {/* 3 */}
          <section id="finalidades" className={styles.section}>
            <h2><span className={styles.num}>3.</span> Finalidades e Base Legal do Tratamento</h2>
            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span>Finalidade</span>
                <span>Base Legal</span>
              </div>
              <div className={styles.tableRow}>
                <span>Autenticação e gestão de conta do cidadão</span>
                <span>Execução de contrato / obrigação legal</span>
              </div>
              <div className={styles.tableRow}>
                <span>Agendamento de emissão ou renovação de BI</span>
                <span>Obrigação legal (Lei do Registo Civil de Angola)</span>
              </div>
              <div className={styles.tableRow}>
                <span>Verificação de identidade e controlo de fraude</span>
                <span>Interesse público legítimo</span>
              </div>
              <div className={styles.tableRow}>
                <span>Envio de notificações sobre o estado do processo</span>
                <span>Consentimento / execução do serviço</span>
              </div>
              <div className={styles.tableRow}>
                <span>Melhoria da plataforma e análise de utilização</span>
                <span>Interesse legítimo do responsável</span>
              </div>
              <div className={styles.tableRow}>
                <span>Arquivo histórico de identificação civil</span>
                <span>Obrigação legal de arquivo público</span>
              </div>
              <div className={styles.tableRow}>
                <span>Resposta a requisições de entidades judiciárias</span>
                <span>Cumprimento de obrigação legal</span>
              </div>
            </div>
            <p className={styles.note}>
              O ITEL não utiliza os dados pessoais para fins comerciais, publicitários ou de marketing.
            </p>
          </section>

          {/* 4 */}
          <section id="destinatarios" className={styles.section}>
            <h2><span className={styles.num}>4.</span> Destinatários dos Dados</h2>
            <p>
              Os dados pessoais podem ser partilhados, exclusivamente no âmbito das finalidades
              descritas, com as seguintes entidades:
            </p>
            <ul>
              <li>
                <strong>Serviço de Identificação Civil (SIC)</strong> — entidade emissora do Bilhete
                de Identidade, para validação e emissão do documento.
              </li>
              <li>
                <strong>Ministério do Interior (MININT)</strong> — para partilha necessária no âmbito
                do registo e segurança do cidadão.
              </li>
              <li>
                <strong>Ministério das Telecomunicações (MINTTICS)</strong> — entidade tutelar para
                supervisão e auditoria.
              </li>
              <li>
                <strong>Fornecedores de Infraestrutura Técnica</strong> — prestadores de serviços de
                alojamento e segurança informática, vinculados por contrato de confidencialidade e
                sujeitos às mesmas obrigações de proteção de dados.
              </li>
              <li>
                <strong>Entidades Judiciárias e de Segurança</strong> — por determinação legal ou
                orden judicial, quando legalmente obrigatório.
              </li>
            </ul>
            <p>
              <strong>Não transferimos</strong> dados pessoais para países terceiros ou organizações
              internacionais sem garantia de nível de proteção equivalente ao exigido pela legislação
              angolana, salvo obrigação legal expressa.
            </p>
          </section>

          {/* 5 */}
          <section id="conservacao" className={styles.section}>
            <h2><span className={styles.num}>5.</span> Prazo de Conservação dos Dados</h2>
            <p>
              Os dados são conservados pelo período estritamente necessário às finalidades que
              justificaram a sua recolha, observando os seguintes critérios:
            </p>
            <ul>
              <li>
                <strong>Dados de conta e identificação civil:</strong> conservados enquanto a conta
                permanecer activa e por um período adicional de <strong>10 anos</strong> após o
                encerramento, nos termos do arquivo público nacional.
              </li>
              <li>
                <strong>Documentos digitalizados submetidos:</strong> eliminados dos servidores activos
                no prazo máximo de <strong>90 dias</strong> após a conclusão do processo, salvo
                exigência legal de conservação.
              </li>
              <li>
                <strong>Logs de acesso e segurança:</strong> conservados por <strong>2 anos</strong>,
                para efeitos de segurança e auditoria.
              </li>
              <li>
                <strong>Dados de agendamento:</strong> conservados por <strong>5 anos</strong> para
                efeitos de historial administrativo.
              </li>
            </ul>
            <p>
              Findo o prazo aplicável, os dados são eliminados de forma definitiva e segura ou
              anonimizados, tornando impossível a identificação do titular.
            </p>
          </section>

          {/* 6 */}
          <section id="direitos" className={styles.section}>
            <h2><span className={styles.num}>6.</span> Direitos do Titular dos Dados</h2>
            <p>
              Nos termos da Lei n.º 22/11 de Angola, o titular dos dados dispõe dos seguintes direitos,
              exercíveis a qualquer momento mediante pedido escrito enviado para{' '}
              <a href="mailto:privacidade@itel.gov.ao">privacidade@itel.gov.ao</a>:
            </p>
            <div className={styles.rightsGrid}>
              <div className={styles.rightCard}>
                <span className={styles.rightIcon}>📋</span>
                <strong>Direito de Acesso</strong>
                <p>Obter confirmação de que os seus dados são tratados e aceder a uma cópia dos mesmos.</p>
              </div>
              <div className={styles.rightCard}>
                <span className={styles.rightIcon}>✏️</span>
                <strong>Direito de Rectificação</strong>
                <p>Exigir a correcção de dados inexactos ou incompletos.</p>
              </div>
              <div className={styles.rightCard}>
                <span className={styles.rightIcon}>🗑️</span>
                <strong>Direito ao Apagamento</strong>
                <p>Solicitar a eliminação dos dados, quando não subsista fundamento legal para o tratamento.</p>
              </div>
              <div className={styles.rightCard}>
                <span className={styles.rightIcon}>⏸️</span>
                <strong>Direito à Limitação</strong>
                <p>Restringir o tratamento em determinadas circunstâncias previstas na lei.</p>
              </div>
              <div className={styles.rightCard}>
                <span className={styles.rightIcon}>📦</span>
                <strong>Direito à Portabilidade</strong>
                <p>Receber os seus dados em formato estruturado e legível por máquina.</p>
              </div>
              <div className={styles.rightCard}>
                <span className={styles.rightIcon}>🚫</span>
                <strong>Direito de Oposição</strong>
                <p>Opor-se ao tratamento baseado em interesse legítimo ou para fins de marketing.</p>
              </div>
            </div>
            <p>
              O pedido será respondido no prazo máximo de <strong>30 dias</strong> úteis. Em casos
              de complexidade ou volume elevado, este prazo pode ser prorrogado por mais 60 dias,
              com prévia notificação ao titular.
            </p>
          </section>

          {/* 7 */}
          <section id="seguranca" className={styles.section}>
            <h2><span className={styles.num}>7.</span> Segurança e Confidencialidade</h2>
            <p>
              O ITEL implementa medidas técnicas e organizacionais adequadas para proteger os dados
              pessoais contra destruição acidental ou ilícita, perda, alteração, divulgação ou acesso
              não autorizado, incluindo:
            </p>
            <ul>
              <li>Transmissão de dados cifrada via protocolo <strong>HTTPS/TLS 1.3</strong></li>
              <li>Armazenamento de palavras-passe com algoritmo de hashing robusto (<strong>bcrypt, factor 12+</strong>)</li>
              <li>Controlo de acesso baseado em funções (RBAC) com princípio do mínimo privilégio</li>
              <li>Autenticação por <strong>JWT</strong> com tokens de curta duração e mecanismo de revogação</li>
              <li>Monitorização contínua de acessos e detecção de anomalias</li>
              <li>Backups cifrados com retenção em localização geograficamente separada</li>
              <li>Auditorias de segurança periódicas e testes de penetração</li>
              <li>Formação obrigatória anual dos colaboradores em protecção de dados</li>
            </ul>
            <p>
              Em caso de violação de dados (<em>data breach</em>) que represente risco para os
              direitos e liberdades dos titulares, o ITEL compromete-se a notificar a autoridade
              supervisora competente no prazo de <strong>72 horas</strong> e os titulares afectados
              sem demora injustificada.
            </p>
          </section>

          {/* 8 */}
          <section id="cookies" className={styles.section}>
            <h2><span className={styles.num}>8.</span> Ficheiros de Sessão (Cookies)</h2>
            <p>Esta plataforma utiliza exclusivamente os seguintes tipos de cookies:</p>
            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span>Nome / Tipo</span>
                <span>Finalidade</span>
                <span>Duração</span>
              </div>
              <div className={styles.tableRow}>
                <span><code>bpi_session</code> — Essencial</span>
                <span>Manter a sessão autenticada do utilizador</span>
                <span>Sessão (eliminado ao fechar o navegador)</span>
              </div>
              <div className={styles.tableRow}>
                <span><code>bpi_remember</code> — Funcional</span>
                <span>Opção «Lembre-se de mim» — persistência facultativa</span>
                <span>30 dias</span>
              </div>
              <div className={styles.tableRow}>
                <span><code>bpi_csrf</code> — Segurança</span>
                <span>Protecção contra ataques CSRF</span>
                <span>Sessão</span>
              </div>
            </div>
            <p>
              Não utilizamos cookies de rastreamento, publicidade ou analítica de terceiros.
              Os cookies essenciais e de segurança não podem ser desactivados, pois são necessários
              ao funcionamento da plataforma.
            </p>
          </section>

          {/* 9 */}
          <section id="menores" className={styles.section}>
            <h2><span className={styles.num}>9.</span> Proteção de Menores</h2>
            <p>
              Esta plataforma destina-se a cidadãos com idade igual ou superior a <strong>18 anos</strong>.
              O registo e agendamento para bilhete de identidade de menor de 18 anos deve ser
              realizado pelo respectivo representante legal (pai, mãe ou tutor legal), que assume
              plena responsabilidade pelas informações prestadas.
            </p>
            <p>
              Caso tomemos conhecimento de que recolhemos dados de menores sem o consentimento
              verificado do representante legal, procederemos à eliminação imediata desses dados
              e notificaremos as entidades competentes quando aplicável.
            </p>
          </section>

          {/* 10 */}
          <section id="alteracoes" className={styles.section}>
            <h2><span className={styles.num}>10.</span> Alterações a Esta Política</h2>
            <p>
              O ITEL reserva-se o direito de actualizar a presente Política de Privacidade sempre
              que necessário, nomeadamente em virtude de alterações legislativas, decisões das
              autoridades de supervisão ou melhorias operacionais. Qualquer alteração será:
            </p>
            <ul>
              <li>Publicada nesta página com indicação da data de entrada em vigor</li>
              <li>Comunicada por correio electrónico aos utilizadores registados, com antecedência
              mínima de <strong>15 dias</strong>, quando as alterações sejam materialmente relevantes</li>
              <li>Sujeita a nova manifestação de consentimento quando a base legal o exija</li>
            </ul>
            <p>
              A continuação da utilização da plataforma após a entrada em vigor de qualquer
              alteração constitui aceitação da política revista.
            </p>
          </section>

          {/* 11 */}
          <section id="contacto" className={styles.section}>
            <h2><span className={styles.num}>11.</span> Contacto e Reclamações</h2>
            <p>Para qualquer questão relativa à presente política ou ao tratamento dos seus dados:</p>
            <div className={styles.contactGrid}>
              <div className={styles.contactCard}>
                <strong>Encarregado de Proteção de Dados (EPD)</strong>
                <p>Instituto de Telecomunicações — ITEL</p>
                <p>Rua Amílcar Cabral, n.º 42, Maianga, Luanda</p>
                <p>
                  <a href="mailto:privacidade@itel.gov.ao">privacidade@itel.gov.ao</a>
                </p>
                <p>+244 931 026 262</p>
              </div>
              <div className={styles.contactCard}>
                <strong>Autoridade de Supervisão</strong>
                <p>
                  Caso considere que os seus direitos não foram respeitados, pode apresentar
                  reclamação junto da autoridade angolana de supervisão de dados pessoais ou do
                  MINTTICS.
                </p>
                <p>
                  <a href="https://www.minttics.gov.ao" target="_blank" rel="noreferrer">
                    www.minttics.gov.ao
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Assinatura */}
          <div className={styles.signature}>
            <p>
              Aprovada pelo Conselho Directivo do ITEL em <strong>1 de Janeiro de 2026</strong>.
            </p>
            <p className={styles.signatureSub}>
              Este documento tem validade legal nos termos da legislação angolana aplicável e
              substitui todas as versões anteriores.
            </p>
          </div>
        </main>

        {/* Voltar */}
        <div className={styles.back}>
          <Link to="/login" className={styles.backLink}>← Voltar ao início de sessão</Link>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>2026 © Bureau Político do IITEL — BPI. Todos os direitos reservados.</p>
        <p>República de Angola · Ministério das Telecomunicações, TIC e Social</p>
      </footer>
    </div>
  );
}
