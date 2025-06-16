import useSWR from 'swr';
import { Frame, Table, TableHead, TableHeadCell, TableRow, TableBody, TableDataCell } from 'react95';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface ScoreRow {
  wallet: string;
  score: number;
  challenge_id?: string;
  metadata?: any;
  timestamp?: string;
}

const FlappyLeaderboardWindow: React.FC = () => {
  const { data } = useSWR<{ scores: ScoreRow[] }>(
    '/api/flappyflunk-leaderboard',
    fetcher
  );

  const scores = data?.scores || [];

  return (
    <Frame variant="well" className="p-2 h-full w-full overflow-auto">
      <Table className="w-full">
        <TableHead>
          <TableRow>
            <TableHeadCell>#</TableHeadCell>
            <TableHeadCell>Wallet</TableHeadCell>
            <TableHeadCell>Score</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {scores.map((row, idx) => (
            <TableRow key={idx} className="w-full">
              <TableDataCell>{idx + 1}</TableDataCell>
              <TableDataCell className="truncate max-w-[120px]">
                {row.wallet}
              </TableDataCell>
              <TableDataCell>{row.score}</TableDataCell>
            </TableRow>
          ))}
          {scores.length === 0 && (
            <TableRow>
              <TableDataCell colSpan={3}>No scores yet</TableDataCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Frame>
  );
};

export default FlappyLeaderboardWindow;
