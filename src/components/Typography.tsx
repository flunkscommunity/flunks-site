import styled from "styled-components";

const H1 = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  padding: 0;
  color: ${({ theme }) => theme.text};
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
  @media (max-width: 320px) {
    font-size: 1rem;
  }
`;

const H2 = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  padding: 0;
  color: ${({ theme }) => theme.text};
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
  @media (max-width: 480px) {
    font-size: 1rem;
  }
  @media (max-width: 320px) {
    font-size: 1rem;
  }
`;

const H3 = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  padding: 0;
  color: ${({ theme }) => theme.text};
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  @media (max-width: 480px) {
    font-size: 1rem;
  }
  @media (max-width: 320px) {
    font-size: 1rem;
  }
`;

const H4 = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  padding: 0;
  color: ${({ theme }) => theme.text};
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  @media (max-width: 480px) {
    font-size: 1rem;
  }
  @media (max-width: 320px) {
    font-size: 1rem;
  }
`;

const H5 = styled.h5`
  font-size: 0.75rem;
  font-weight: 700;
  margin: 0;
  padding: 0;
  color: ${({ theme }) => theme.text};
  @media (max-width: 768px) {
    font-size: 0.5rem;
  }
  @media (max-width: 480px) {
    font-size: 0.25rem;
  }
  @media (max-width: 320px) {
    font-size: 0.125rem;
  }
`;

const H6 = styled.h6`
  font-size: 0.5rem;
  font-weight: 700;
  margin: 0;
  padding: 0;
  color: ${({ theme }) => theme.text};
  @media (max-width: 768px) {
    font-size: 0.25rem;
  }
  @media (max-width: 480px) {
    font-size: 0.125rem;
  }
  @media (max-width: 320px) {
    font-size: 0.0625rem;
  }
`;

const P = styled.p`
  font-size: 19px;
  font-weight: 400;
  margin: 0;
  padding: 0;
  color: ${({ theme }) => theme.text};
  @media (max-width: 768px) {
    font-size: 19px;
  }
  @media (max-width: 480px) {
    font-size: 19px;
  }
  @media (max-width: 320px) {
    font-size: 16px;
  }
`;

export { H1, H2, H3, H4, H5, H6, P };
