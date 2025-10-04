import useSWR from 'swr';
import { useEffect } from 'react';
import {
  Frame,
  Table,
  TableHead,
  TableHeadCell,
  TableRow,
  TableBody,
  TableDataCell,
} from 'react95';
import UserDisplay from 'components/UserDisplay';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface LeaderboardResponse {
  success: boolean;
  leaderboard: ScoreRow[];
  total_unique_players: number;
  fetched_at: string;
}

interface ScoreRow {
  rank: number;
  wallet: string;
  score: number;
  username: string;
  profile_icon?: string;
  timestamp?: string;
  formatted_date?: string;
}

const FlunkyUppyLeaderboardWindow: React.FC = () => {
  const {
    data: response,
    error,
    isValidating,
    mutate,
  } = useSWR<LeaderboardResponse>('/api/flunky-uppy-leaderboard', fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 2000,
  });

  // Lightweight polling to keep the board current after repeated submissions
  useEffect(() => {
    const id = setInterval(() => {
      mutate();
    }, 10000); // every 10s
    return () => clearInterval(id);
  }, [mutate]);

  const isLoading = !response && !error;
  const scores = response?.leaderboard || [];
  const hasScores = scores && scores.length > 0;

  return (
    <Frame variant="well" className="p-2 h-full w-full overflow-auto">
      <div className="mb-2 text-center">
        <h3 style={{ margin: '8px 0', fontSize: '16px', fontWeight: 'bold' }}>
          Flunky Uppy Leaderboard
        </h3>
        {response && (
          <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
            {response.total_unique_players} unique players
          </p>
        )}
      </div>
      
      <Table className="w-full">
        <TableHead>
          <TableRow>
            <TableHeadCell>#</TableHeadCell>
            <TableHeadCell>Player</TableHeadCell>
            <TableHeadCell>Score</TableHeadCell>
            <TableHeadCell>Date</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {error && (
            <TableRow>
              <td colSpan={4} style={{ padding: 8, textAlign: 'center' }}>⚠️ Failed to load scores</td>
            </TableRow>
          )}

          {isLoading && (
            <TableRow>
              <td colSpan={4} style={{ padding: 8, textAlign: 'center' }}>Loading leaderboard...</td>
            </TableRow>
          )}

          {hasScores &&
            scores.map((row, idx) => (
              <TableRow key={row.wallet + row.score}>
                <TableDataCell style={{ fontWeight: 'bold' }}>
                  {row.rank === 1 && '🥇'}
                  {row.rank === 2 && '🥈'}
                  {row.rank === 3 && '🥉'}
                  {row.rank > 3 && row.rank}
                </TableDataCell>
                <TableDataCell className="truncate max-w-[120px]" title={row.username}>
                  <UserDisplay
                    username={row.username}
                    profileIcon={row.profile_icon}
                    size="small"
                    showWalletFallback={true}
                    walletAddress={row.wallet}
                    style={{
                      color: '#000',
                      fontWeight: 'normal'
                    }}
                  />
                </TableDataCell>
                <TableDataCell style={{ fontWeight: 'bold', color: '#0066cc' }}>
                  {row.score}
                </TableDataCell>
                <TableDataCell style={{ fontSize: '11px', color: '#666' }}>
                  {row.formatted_date}
                </TableDataCell>
              </TableRow>
            ))}

          {!isLoading && !error && scores?.length === 0 && (
            <TableRow>
              <td colSpan={4} style={{ padding: 8, textAlign: 'center' }}>
                No scores yet! Be the first to play! 🦘
              </td>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Frame>
  );
};

export default FlunkyUppyLeaderboardWindow;